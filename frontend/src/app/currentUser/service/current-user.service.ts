import { Injectable } from '@angular/core';
import { CurrentUserInterface } from '../../interfaces/current-user.interface';

@Injectable({
  providedIn: 'root'
})
export class CurrentUserService {
  // Ključ za čuvanje korisnika u localStorage
  private currentUserKey = 'currentUser';

  // Privatan objekat koji čuva trenutno ulogovanog korisnika u memoriji
  private _currentUser: CurrentUserInterface | null = null;

  constructor() {
    // Pokušava da učitaš korisnika iz localStorage prilikom inicijalizacije servisa
    const savedUser = localStorage.getItem(this.currentUserKey);
    if (savedUser) {
      // Ako postoji sačuvani korisnik, parsiraj ga iz JSON stringa u objekat
      this._currentUser = JSON.parse(savedUser);
    }
  }

  /**
   * Postavlja trenutno ulogovanog korisnika i čuva ga u memoriji i u localStorage
   * @param user objekat trenutnog korisnika koji treba sačuvati
   */
  setCurrentUser(user: CurrentUserInterface) {
  this._currentUser = user;
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(this.currentUserKey, JSON.stringify(user));
  }
}

  /**
   * Vraća objekat trenutno ulogovanog korisnika iz memorije
   * @returns objekat trenutnog korisnika ili null ako nije niko ulogovan
   */
  getCurrentUser(): CurrentUserInterface | null {
    return this._currentUser;
  }

  /**
   * Briše podatke o korisniku iz memorije i localStorage (koristi se prilikom odjave)
   */
clearCurrentUser() {
  this._currentUser = null;
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(this.currentUserKey);
  }
}

  /**
   * Proverava da li postoji trenutno ulogovan korisnik
   * @returns true ako je korisnik ulogovan, false ako nije
   */
  isLoggedIn(): boolean {
    return this._currentUser !== null;
  }

  /**
   * Proverava da li je trenutno ulogovani korisnik administrator
   * @returns true ako je tip korisnika 'admin', false ako nije ili nema korisnika
   */
  isAdmin(): boolean {
    return this._currentUser?.tip_korisnika === 'admin';
  }

  /**
   * Proverava da li je trenutno ulogovani korisnik pravno lice
   * @returns true ako je tip korisnika 'pravno_lice', false ako nije ili nema korisnika
   */
  isPravnoLice(): boolean {
    return this._currentUser?.tip_korisnika === 'pravno_lice';
  }

  /**
   * Proverava da li je trenutno ulogovani korisnik fizičko lice
   * @returns true ako je tip korisnika 'fizicko_lice', false ako nije ili nema korisnika
   */
  isFizickoLice(): boolean {
    return this._currentUser?.tip_korisnika === 'fizicko_lice';
  }
}
