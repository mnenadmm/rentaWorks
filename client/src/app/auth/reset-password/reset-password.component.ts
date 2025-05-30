import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent {
  email: string = '';
  successMessage: string | null = null;
  errorMessage: string | null = null;
  isSubmitting = false;

  constructor(private router: Router) {}

  onSubmit(): void {
    // Resetujemo poruke pre validacije
    this.successMessage = null;
    this.errorMessage = null;

    if (!this.email) {
      this.errorMessage = 'Email je obavezan.';
      return;
    }

    if (!this.validateEmail(this.email)) {
      this.errorMessage = 'Unesite validnu email adresu.';
      return;
    }

    // Odmah postavljamo isSubmitting kako bismo blokirali dalje klikove
    this.isSubmitting = true;

    // Odmah postavljamo successMessage, ne čekamo
    this.successMessage = 'Link za reset lozinke je poslat na tvoju email adresu.';
    this.errorMessage = null;  // Ukloni grešku čim uspešno pošaljemo
    this.email = '';  // Očisti input

    // Nakon 3 sekunde vrši redirekciju
    setTimeout(() => {
      this.router.navigate(['/login']);
      this.isSubmitting = false; // omogući dugme nakon redirekcije (ako se vrati)
    }, 3000);
  }

  private validateEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.toLowerCase());
  }
}
