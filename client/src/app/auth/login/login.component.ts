import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; 
import { LoginLockService } from '../../services/login-lock.service';// putanja može da varira

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  showPassword: boolean = false;
  errorMessage: string = '';
  isLockedOut: boolean = false;

  constructor(private loginLockService: LoginLockService) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onLogin() {
    this.errorMessage = '';

    if (!this.loginLockService.canAttempt()) {
      const remaining = Math.ceil(this.loginLockService.getRemainingLockTime() / 1000);
      this.errorMessage = `Previše neuspešnih pokušaja. Pokušajte ponovo za ${remaining} sekundi.`;
      this.isLockedOut = true;
      return;
    }

    if (this.username && this.password) {
      const isValid = this.fakeLogin(this.username, this.password);

      this.loginLockService.recordAttempt(isValid);

      if (!isValid) {
        this.errorMessage = 'Korisničko ime ili lozinka nisu ispravni. Molimo pokušajte ponovo.';
      } else {
        this.errorMessage = '';
        this.isLockedOut = false;
        // Uspešna prijava - dodaj ovde dalje akcije ako treba
        console.log('Prijava uspešna:', this.username);
      }
    } else {
      this.errorMessage = 'Korisničko ime i lozinka su obavezni.';
    }

    this.isLockedOut = this.loginLockService.isLocked();
  }

  // Primer funkcije za validaciju - zameni sa stvarnim pozivom backendu
  fakeLogin(user: string, pass: string): boolean {
    return user === 'admin' && pass === 'admin123';
  }
}
