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
  username = '';
  password = '';
  showPassword = false;
  errorMessage = '';
  // Da li je korisnik trenutno zaključan zbog previše neuspešnih pokušaja
  isLockedOut = false;
  // Vreme (u sekundama) do kraja zaključavanja
  remainingLockTime = 0;
  // Pretplata na osvežavanje preostalog vremena
  private timerSub?: Subscription;
  constructor(private loginLockService: LoginLockService) {
    // Proveri da li je korisnik odmah zaključan
    this.isLockedOut = this.loginLockService.isLocked();
    // Pretplati se na promene vremena do kraja zaključavanja
    this.timerSub = this.loginLockService.remainingTime$.subscribe(time => {
      this.remainingLockTime = time;
      this.isLockedOut = this.loginLockService.isLocked();
      // Ažuriraj poruku o grešci ako je korisnik zaključan
      if (this.isLockedOut) {
        this.errorMessage = `Previše neuspešnih pokušaja. Pokušajte ponovo za ${this.remainingLockTime} sekundi.`;
      } else {
        this.errorMessage = '';
      }
    });
  }
  // Funkcija za prikaz/sakrivanje lozinke
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onLogin() {
    // Ako je korisnik zaključan – prekini proces prijave
    if (this.isLockedOut) {
      return;
    }
    // Provera da li su oba polja popunjena
    if (!this.username || !this.password) {
      this.errorMessage = 'Korisničko ime i lozinka su obavezni.';
      return;
    }

    // ✅ DODATA VALIDACIJA LOZINKE:
    // - najmanje 8 karaktera
    // - bar jedno veliko slovo
    const hasMinLength = this.password.length >= 8;
    const hasUppercase = /[A-Z]/.test(this.password);
    if (!hasMinLength || !hasUppercase) {
      this.errorMessage = 'Lozinka mora imati najmanje 8 karaktera i bar jedno veliko slovo.';
      return;
    }
    // Poziv fiktivne funkcije za proveru kredencijala (dummy login)
    const isValid = this.fakeLogin(this.username, this.password);
    // Evidentiraj pokušaj logovanja
    this.loginLockService.recordAttempt(isValid);
    // Ako prijava nije uspešna – prikaži poruku
    if (!isValid) {
      this.errorMessage = 'Korisničko ime ili lozinka nisu ispravni. Molimo pokušajte ponovo.';
    } else {
      // Uspešna prijava – obrisi poruku o grešci
      this.errorMessage = '';
      console.log('Prijava uspešna:', this.username);
      // TODO: ovde možeš dodati navigaciju (router.navigate)
    }
  }

  // Privremena metoda za "fake" login (može se zameniti pravim backend pozivom)
  fakeLogin(user: string, pass: string): boolean {
    return user === 'admin' && pass === 'admin123';
  }

  // Očisti pretplatu kada komponenta bude uništena (da se spreče memory leak-ovi)
  ngOnDestroy() {
    this.timerSub?.unsubscribe();
  }
}
