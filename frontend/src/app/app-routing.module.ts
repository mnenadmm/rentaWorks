import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './authentication/login/login.component';
import { RegistracijaComponent } from './authentication/registracija/registracija.component';
import { ResetPasswordComponent } from './authentication/reset-password/reset-password.component';
const routes: Routes = [
     { path: 'login', component: LoginComponent },
     { path: 'reset-password', component: ResetPasswordComponent },
     { path: 'register', component: RegistracijaComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
