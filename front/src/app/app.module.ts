import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { routes } from './app.routes';
import { LoginComponent } from './components/login/login.component';  // ako koristiš rute

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HeaderComponent,
    // ovde stavi sve komponente koje koristiš u app modu
  
    
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes),  // ako imaš rute
    // drugi moduli ako imaš
  ],
  providers: [],
  bootstrap: []
})
export class AppModule { }
