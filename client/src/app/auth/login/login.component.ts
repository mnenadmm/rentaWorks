import { Component, OnDestroy } from '@angular/core';
import { LoginLockService } from '../../services/login-lock.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone:false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnDestroy {
  username = '';
  password = '';
  showPassword = false;
  errorMessage = '';
  isLockedOut = false;
  remainingLockTime = 0;
  private timerSub?: Subscription;

  constructor(private loginLockService: LoginLockService) {
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
    const isValid = validFormat && this.fakeLogin(this.username, this.password);
    
    this.loginLockService.recordAttempt(isValid);

    if (!isValid) {
      this.errorMessage = 'Korisničko ime ili lozinka nisu ispravni. Molimo pokušajte ponovo.';
      return;
    }

    this.errorMessage = '';
    console.log('Prijava uspešna:', this.username);
    // TODO: dodati navigaciju po potrebi
  }

  fakeLogin(user: string, pass: string): boolean {
    return user === 'admin' && pass === 'Admin123';
  }

  ngOnDestroy() {
    this.timerSub?.unsubscribe();
  }
}
