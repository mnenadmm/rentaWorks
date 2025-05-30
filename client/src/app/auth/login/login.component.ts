import { Component, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LoginLockService } from '../../services/login-lock.service';
import { Subscription } from 'rxjs';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule,RouterModule],
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
      if (this.isLockedOut) {
        this.errorMessage = `Previše neuspešnih pokušaja. Pokušajte ponovo za ${this.remainingLockTime} sekundi.`;
      } else {
        this.errorMessage = '';
      }
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onLogin() {
    if (this.isLockedOut) {
      return;
    }

    if (!this.username || !this.password) {
      this.errorMessage = 'Korisničko ime i lozinka su obavezni.';
      return;
    }

    const isValid = this.fakeLogin(this.username, this.password);

    this.loginLockService.recordAttempt(isValid);

    if (!isValid) {
      this.errorMessage = 'Korisničko ime ili lozinka nisu ispravni. Molimo pokušajte ponovo.';
    } else {
      this.errorMessage = '';
      console.log('Prijava uspešna:', this.username);
      // ovde ide redirect ili dalji tok prijave
    }
  }

  fakeLogin(user: string, pass: string): boolean {
    return user === 'admin' && pass === 'admin123';
  }

  ngOnDestroy() {
    this.timerSub?.unsubscribe();
  }
}
