import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './authentication/login/login.component';
import { RegistracijaComponent } from './authentication/registracija/registracija.component';
import { ResetPasswordComponent } from './authentication/reset-password/reset-password.component';
import { ProfilComponent } from './components/profil/profil.component';
import { KreirajFirmuComponent } from './components/kreiraj-firmu/kreiraj-firmu.component';
import { MojaFirmaComponent } from './components/moja-firma/moja-firma.component';
const routes: Routes = [
     { path: 'login', component: LoginComponent },
     { path: 'reset-password', component: ResetPasswordComponent },
     { path: 'register', component: RegistracijaComponent },
     { path: 'profil', component: ProfilComponent },
     { path: 'kreirajFirmu', component: KreirajFirmuComponent },
     { path: 'mojaFirma', component: MojaFirmaComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
