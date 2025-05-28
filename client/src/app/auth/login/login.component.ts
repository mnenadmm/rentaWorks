import { Component } from '@angular/core';

@Component({
  selector: 'app-login',
  standalone: true, // ← OVO DODAJ
  imports: [],       // ← Kasnije ovde možeš dodati FormsModule ako ti treba
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'] // ← sitna greška: treba "styleUrls", a ne "styleUrl"
})
export class LoginComponent {

}
