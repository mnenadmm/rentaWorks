import { Component, OnDestroy } from '@angular/core';
import { LoginLockService } from '../../../services/login-lock.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { CurrentUserInterface } from '../../interfaces/current-user.interface';
import { CurrentUserService } from '../../currentUser/service/current-user.service';
import { AuthenticationService } from '../../../services/authentication.service';
@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnDestroy {
  username = '';
  lozinka = '';
  showPassword = false;
  errorMessage = '';
  isLockedOut = false;
  remainingLockTime = 0;
  private timerSub?: Subscription;
  currentUser!: CurrentUserInterface; // Objekat za tipizovanog korisnika
  constructor(
    private loginLockService: LoginLockService, 
    private authService: AuthenticationService,
    private router: Router,
    private currentUserService: CurrentUserService,
  
  ) {
    this.isLockedOut = this.loginLockService.isLocked();
    this.timerSub = this.loginLockService.remainingTime$.subscribe(time => {
      this.remainingLockTime = time;
      this.isLockedOut = this.loginLockService.isLocked();
      this.errorMessage = this.isLockedOut
        ? `Previše neuspešnih pokušaja. Pokušajte ponovo za ${this.remainingLockTime} sekundi.`
        : '';
    });
  }


  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onLogin() {
  if (this.isLockedOut) return;
  if (!this.username || !this.lozinka) {
    this.errorMessage = 'Korisničko ime i lozinka su obavezni.';
    return;
  }

  const validFormat = this.lozinka.length >= 8 && /[A-Z]/.test(this.lozinka);
  if (!validFormat) {
    this.loginLockService.recordAttempt(false);  // Neuspeh zbog lošeg formata
    this.errorMessage = 'Lozinka mora imati najmanje 8 karaktera i jedno veliko slovo.';
    return;
  }

  const credentials = {
    username: this.username,
    lozinka: this.lozinka
  };

  this.authService.login(credentials).subscribe({
    next: (response) => {
      this.loginLockService.recordAttempt(true);  // Uspešan login
      this.errorMessage = '';
      const user = response.user;
      this.currentUser = {
        id: user.id,
        username: user.username,
        tip_korisnika: user.tip_korisnika,
        aktivan: true,
        ima_firmu: user.ima_firmu
      };
      this.currentUserService.setCurrentUser(this.currentUser);
      this.router.navigate(['/']);
    },
    error: (error) => {
      if (error.status === 401){
        this.loginLockService.recordAttempt(false); // Neuspešan login
        this.errorMessage = error.error?.error || 'Greška pri prijavi. Pokušajte ponovo.';
      }else {
        // Za druge greške ne tretiraj kao neuspešan pokušaj, već recimo obavesti korisnika
       this.errorMessage = error.error?.error || 'Greška pri prijavi. Pokušajte ponovo.';
      }
      
      
    }
  });
}

  ngOnDestroy() {
    this.timerSub?.unsubscribe();
  }
}
