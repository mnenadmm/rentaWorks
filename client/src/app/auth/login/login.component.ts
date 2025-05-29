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
  errorMessage: string = '';
  maxAttempts: number = 3;
  loginAttempts: number = 0;
  isLockedOut: boolean = false;
  lockoutTime: number = 30; // sekundi
  remainingTime: number = this.lockoutTime;

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onLogin() {
    // Resetuj error poruku pre provere
    this.errorMessage = '';
    if (this.isLockedOut) {
      this.errorMessage = `Previše neuspešnih pokušaja. Pokušajte ponovo za ${this.remainingTime} sekundi.`;
      return;
    }
    if (this.username && this.password) {
      const isValid = this.username === 'admin' && this.password === 'admin123';
    if (isValid){
       console.log('Prijava uspešna:', this.username);
        this.loginAttempts = 0;
        this.errorMessage = '';
    }else{
        this.loginAttempts++;
        if (this.loginAttempts >= this.maxAttempts){
            this.lockUserOut();
        }else{
           this.errorMessage = 'Korisničko ime ili lozinka nisu ispravni. Molimo pokušajte ponovo.';
        }
    }
    } else {
     this.errorMessage = 'Korisničko ime ili lozinka nisu ispravni. ';
    }
  }
  lockUserOut() {
    this.isLockedOut = true;
    this.errorMessage = `Previše neuspešnih pokušaja. Pokušajte ponovo za ${this.lockoutTime} sekundi.`;
    this.remainingTime = this.lockoutTime;

    const interval = setInterval(() => {
      this.remainingTime--;
      this.errorMessage = `Previše neuspešnih pokušaja. Pokušajte ponovo za ${this.remainingTime} sekundi.`;

      if (this.remainingTime <= 0) {
        clearInterval(interval);
        this.isLockedOut = false;
        this.loginAttempts = 0;
        this.errorMessage = '';
      }
    }, 1000);
  }
}
