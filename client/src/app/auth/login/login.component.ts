import { Component, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LoginLockService } from '../../services/login-lock.service';
import { Subscription } from 'rxjs';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnDestroy {
  // Polja za unos korisničkog imena i lozinke
  username = '';
  password = '';

  // Kontrola prikaza lozinke (tekstualno ili maskirano)
  showPassword = false;

  // Poruka o grešci
  errorMessage = '';

  // Da li je korisnik trenutno zaključan zbog više neuspešnih pokušaja
  isLockedOut = false;

  // Vreme koje je ostalo do kraja zaključavanja (u sekundama)
  remainingLockTime = 0;

  // Pretplata na timer koji se osvežava svakih sekund
  private timerSub?: Subscription;

  constructor(private loginLockService: LoginLockService) {
    // Proveri odmah da li je korisnik zaključan
    this.isLockedOut = this.loginLockService.isLocked();

    // Pretplata na promene vremena do otključavanja
    this.timerSub = this.loginLockService.remainingTime$.subscribe(time => {
      this.remainingLockTime = time;
      this.isLockedOut = this.loginLockService.isLocked();

      // Ažuriraj poruku u skladu sa statusom zaključavanja
      if (this.isLockedOut) {
        this.errorMessage = `Previše neuspešnih pokušaja. Pokušajte ponovo za ${this.remainingLockTime} sekundi.`;
      } else {
        this.errorMessage = '';
      }
    });
  }

  // Promena vidljivosti lozinke
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  // Glavna metoda za prijavu
  onLogin() {
    // Ako je korisnik zaključan, ne dozvoli prijavu
    if (this.isLockedOut) {
      return;
    }

    // Provera da li su oba polja popunjena
    if (!this.username || !this.password) {
      this.errorMessage = 'Korisničko ime i lozinka su obavezni.';
      return;
    }

    // Fiktivna provera podataka (možeš povezati sa backendom)
    const isValid = this.fakeLogin(this.username, this.password);

    // Zabeleži pokušaj logovanja (uspešan ili ne)
    this.loginLockService.recordAttempt(isValid);

    if (!isValid) {
      this.errorMessage = 'Korisničko ime ili lozinka nisu ispravni. Molimo pokušajte ponovo.';
    } else {
      this.errorMessage = '';
      console.log('Prijava uspešna:', this.username);
      // Ovde ide navigacija ka početnoj stranici ili dashboard-u
    }
  }

  // Privremena funkcija za validaciju (menjati za realan backend)
  fakeLogin(user: string, pass: string): boolean {
    return user === 'admin' && pass === 'admin123';
  }

  // Očisti pretplatu kada se komponenta uništi
  ngOnDestroy() {
    this.timerSub?.unsubscribe();
  }
}
