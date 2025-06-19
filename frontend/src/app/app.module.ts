import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule, provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { LoginComponent } from './authentication/login/login.component';
import { ResetPasswordComponent } from './authentication/reset-password/reset-password.component';
import { RegistracijaComponent } from './authentication/registracija/registracija.component';
import { CustomDatepickerComponent } from './components/custom-datepicker/custom-datepicker.component';
import { HttpClientModule } from '@angular/common/http';
import { ProfilComponent } from './components/profil/profil.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    LoginComponent,
    ResetPasswordComponent,
    RegistracijaComponent,
    CustomDatepickerComponent,
    ProfilComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
     HttpClientModule,
    
  
  ],
  providers: [
    provideClientHydration(withEventReplay())
    
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
