import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; 
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  showPassword: boolean = false;
  errorMessage: string | null = 'Uneli ste pogresno korisnicko ime ili lozinku';

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onLogin() {
    // Resetuj error poruku pre provere
    this.errorMessage = null;

    if (this.username && this.password) {
      console.log('Prijava uspešna:', this.username, this.password);
      // Ovde možeš emitovati event, pozvati servis, itd.
    } else {
      this.errorMessage = 'Molimo unesite korisničko ime i lozinku.';
    }
  }
}
