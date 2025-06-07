// app.module.ts

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { RegistracijaModule } from './auth/registracija/registracija.module';  // ako je modul
import { routes } from './app.routes';  // tvoje rute
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    // ostale komponente ako ih imaš direktno
  ],
  imports: [
    BrowserModule,
    FormsModule,
    RouterModule.forRoot(routes),
    RegistracijaModule,
    // ostali moduli
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
