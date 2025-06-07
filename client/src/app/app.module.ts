// app.module.ts
import { ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { RegistracijaModule } from './auth/registracija/registracija.module';  // ako je modul
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { ResetPasswordComponent } from './auth/reset-password/reset-password.component';
import { RegistracijaComponent } from './auth/registracija/registracija.component';
import { LoginComponent } from './auth/login/login.component';
//Uvozimo appRoutingMOdule koji sam sam kreirao
import { AppRoutingModule } from './app-routing.module';
@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    ResetPasswordComponent,
    RegistracijaComponent,
    LoginComponent,

    // ostale komponente ako ih imaš direktno
  ],
  imports: [
     AppRoutingModule, // uključi routing ovde
    BrowserModule,
    FormsModule,
    RegistracijaModule,
    ReactiveFormsModule,
    // ostali moduli
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
