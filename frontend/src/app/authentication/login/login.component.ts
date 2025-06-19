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
    this.loginLockService.recordAttempt(false);
    this.errorMessage = 'Lozinka mora imati najmanje 8 karaktera i jedno veliko slovo.';
    return;
  }
    this.loginLockService.recordAttempt(validFormat);
    
    const credentials = {
    username: this.username, 
    lozinka: this.lozinka
                        };
    this.authService.login(credentials).subscribe({
      next: (response)=>{
        this.loginLockService.recordAttempt(true); //resetuj pokusaje
        this.errorMessage = '';
        this.currentUser={
            id: response.user_id,
            username: this.username,
            tip_korisnika: response.tip_korisnika,
            aktivan: true
        }
        this.currentUserService.setCurrentUser(this.currentUser);
        console.log('Login ')
       // this.router.navigate(['/']);
    
      },error : (error)=>{
          this.loginLockService.recordAttempt(false);
      this.errorMessage = error.error?.error || 'Greška pri prijavi. Pokušajte ponovo.';
      }
    })
    
  }
  ngOnDestroy() {
    this.timerSub?.unsubscribe();
  }
}
