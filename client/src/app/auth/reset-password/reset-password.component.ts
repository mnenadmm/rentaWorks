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
    this.successMessage = null;
    this.errorMessage = null;

    // Fallback validacija (ako nekako zaobiđe HTML validaciju)
    if (!this.email) {
      this.errorMessage = 'Email je obavezan.';
      return;
    }

    if (!this.validateEmail(this.email)) {
      this.errorMessage = 'Unesite validnu email adresu.';
      return;
    }

    this.isSubmitting = true;
    this.successMessage = 'Link za reset lozinke je poslat na tvoju email adresu.';
    this.errorMessage = null;

    // Ne brišemo email ovde — jer bi to okinulo error validaciju na inputu
    // Redirect posle 3 sekunde
    setTimeout(() => {
      this.router.navigate(['/login']);
      this.isSubmitting = false;
    }, 3000);
  }

  private validateEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.toLowerCase());
  }
}
