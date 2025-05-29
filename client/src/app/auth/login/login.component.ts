import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  showPassword: boolean = false;

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onLogin() {
    if (this.username && this.password) {
      console.log('Prijava uspešna:', this.username, this.password);
      // Ovde možeš emitovati event, pozvati servis, itd.
    } else {
      alert('Molimo unesite korisničko ime i lozinku.');
    }
  }
}
