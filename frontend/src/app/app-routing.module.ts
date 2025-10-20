import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './authentication/login/login.component';
import { RegistracijaComponent } from './authentication/registracija/registracija.component';
import { ResetPasswordComponent } from './authentication/reset-password/reset-password.component';
import { ProfilComponent } from './components/profil/profil.component';
import { KreirajFirmuComponent } from './components/kreiraj-firmu/kreiraj-firmu.component';
import { MojaFirmaComponent } from './components/moja-firma/moja-firma.component';
import { IzlistajFirmeComponent } from './components/izlistaj-firme/izlistaj-firme.component';
import { FirmaIzmenaComponent } from './components/firma-izmena/firma-izmena.component';
import { OglasiListaComponent } from './oglasi/oglasi-lista/oglasi-lista.component';
import { OglasiFormaComponent } from './oglasi/oglasi-forma/oglasi-forma.component';
import { UpravljajOglasimaComponent } from './components/upravljaj-oglasima/upravljaj-oglasima.component';
import { AzurirajOglasComponent } from './oglasi/azuriraj-oglas/azuriraj-oglas.component';
import { FirmaDetaljiComponent } from './components/firma-detalji/firma-detalji.component';
import { UserDetaljiComponent } from './components/user-detalji/user-detalji.component';
import { ChatWindowComponent } from './components/chat/chat-window/chat-window.component';
const routes: Routes = [
     { path: 'login', component: LoginComponent },
     { path: 'reset-password', component: ResetPasswordComponent },
     { path: 'register', component: RegistracijaComponent },
     { path: 'profil', component: ProfilComponent },
     { path: 'kreirajFirmu', component: KreirajFirmuComponent },
     { path: 'mojaFirma', component: MojaFirmaComponent },
      {path: 'listaFirmi', component: IzlistajFirmeComponent },
      { path: 'moja-firma/izmena', component: FirmaIzmenaComponent },
      { path: 'oglasi', component: OglasiListaComponent },
     { path: 'oglasi/dodaj', component: OglasiFormaComponent },
     { path: 'upravljaj-oglasima', component: UpravljajOglasimaComponent },
     { path: 'azuriraj-oglas/:id', component: AzurirajOglasComponent },
     {path: 'firma/:id',component: FirmaDetaljiComponent},
     { path: 'korisnici/:id', component: UserDetaljiComponent },
     { path: 'chat/:id', component: ChatWindowComponent },
     { path: '**', redirectTo: '' }, // za nepostojece rute
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
