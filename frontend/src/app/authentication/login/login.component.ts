import { Component, OnDestroy } from '@angular/core';
import { LoginLockService } from '../../../services/login-lock.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../../services/authentication.service';
@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnDestroy {
  username = '';
  password = '';
  showPassword = false;
  errorMessage = '';
  isLockedOut = false;
  remainingLockTime = 0;
  private timerSub?: Subscription;

  constructor(private loginLockService: LoginLockService, private authService: AuthenticationService,private router: Router) {
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

    if (!this.username || !this.password) {
      this.errorMessage = 'Korisničko ime i lozinka su obavezni.';
      return;
    }

    const validFormat = this.password.length >= 8 && /[A-Z]/.test(this.password);
    if (!validFormat) {
    this.loginLockService.recordAttempt(false);
    this.errorMessage = 'Lozinka mora imati najmanje 8 karaktera i jedno veliko slovo.';
    return;
  }
    this.loginLockService.recordAttempt(validFormat);
    
    const credentials = {
    email: this.username, 
    password: this.password
                        };
    this.authService.login(credentials).subscribe({
      next: (response)=>{
        this.loginLockService.recordAttempt(true); //resetuj pokusaje
        this.errorMessage = '';
        this.router.navigate(['/']);
    console.log('Prijava uspešna:', response);
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
