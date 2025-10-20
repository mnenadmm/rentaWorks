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
import { KreirajFirmuComponent } from './components/kreiraj-firmu/kreiraj-firmu.component';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './auth.interceptor';
import { MojaFirmaComponent } from './components/moja-firma/moja-firma.component';
import { IzlistajFirmeComponent } from './components/izlistaj-firme/izlistaj-firme.component';
import { FirmaIzmenaComponent } from './components/firma-izmena/firma-izmena.component';
import { OglasiListaComponent } from './oglasi/oglasi-lista/oglasi-lista.component';

import { OglasiFormaComponent } from './oglasi/oglasi-forma/oglasi-forma.component';
import { UpravljajOglasimaComponent } from './components/upravljaj-oglasima/upravljaj-oglasima.component';
import { AzurirajOglasComponent } from './oglasi/azuriraj-oglas/azuriraj-oglas.component';
import { FirmaDetaljiComponent } from './components/firma-detalji/firma-detalji.component';
import { ChatGptComponent } from './components/chat-gpt/chat-gpt.component';
import { UserDetaljiComponent } from './components/user-detalji/user-detalji.component';
import { ChatComponent } from './components/chat/chat/chat.component';
import { ChatListComponent } from './components/chat/chat-list/chat-list.component';
import { ChatWindowComponent } from './components/chat/chat-window/chat-window.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    LoginComponent,
    ResetPasswordComponent,
    RegistracijaComponent,
    CustomDatepickerComponent,
    ProfilComponent,
    KreirajFirmuComponent,
    MojaFirmaComponent,
    IzlistajFirmeComponent,
    FirmaIzmenaComponent,
    OglasiListaComponent,
    OglasiFormaComponent,
    UpravljajOglasimaComponent,
    AzurirajOglasComponent,
    FirmaDetaljiComponent,
    ChatGptComponent,
    UserDetaljiComponent,
    ChatComponent,
    ChatListComponent,
    ChatWindowComponent,
    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
     HttpClientModule,
    
  
  ],
  providers: [
    provideClientHydration(withEventReplay()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
    
    
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
