import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { PocetnaComponent } from './components/pocetna/pocetna.component';
import { RegistracijaComponent } from './auth/registracija/registracija.component';
export const routes: Routes = [
    { path: '', component: PocetnaComponent },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegistracijaComponent },
    
];
