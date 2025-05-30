import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent {
  email: string = '';
  successMessage: string | null = null;
  errorMessage: string | null = null;

  onSubmit(): void {
    this.successMessage = null;
    this.errorMessage = null;

    if (this.email.toLowerCase().includes('@')) {
      this.successMessage = 'Link za reset lozinke je poslat na tvoju email adresu.';
      this.email = '';
    } else {
      this.errorMessage = 'Došlo je do greške prilikom slanja zahteva. Proveri email i pokušaj ponovo.';
    }
  }
}
