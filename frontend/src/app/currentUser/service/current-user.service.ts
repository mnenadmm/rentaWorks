import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CurrentUserInterface } from '../../interfaces/current-user.interface';

@Injectable({
  providedIn: 'root'
})
export class CurrentUserService {
  private currentUserKey = 'currentUser';
  private _currentUser: CurrentUserInterface | null = null;
   // BehaviorSubject sa početnom vrednošću null (nije ulogovan)
  private currentUserSubject = new BehaviorSubject<CurrentUserInterface | null>(null);
  // Observable za praćenje spolja
  currentUser$: Observable<CurrentUserInterface | null> = this.currentUserSubject.asObservable();

  constructor() {
    if (this.isBrowser()) {
      const savedUser = localStorage.getItem(this.currentUserKey);
      if (savedUser) {
        this._currentUser = JSON.parse(savedUser);
        this.currentUserSubject.next(this._currentUser); // emituj stanje na startu
      }
    }
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  setCurrentUser(user: CurrentUserInterface) {
    this._currentUser = user;
    this.currentUserSubject.next(user); // emituj novu vrednost
    if (this.isBrowser()) {
      localStorage.setItem(this.currentUserKey, JSON.stringify(user));
    }
  }

  getCurrentUser(): CurrentUserInterface | null {
    return this._currentUser;
  }

  clearCurrentUser() {
    this._currentUser = null;
    this.currentUserSubject.next(null); // emituj da nema korisnika
    if (this.isBrowser()) {
      localStorage.removeItem(this.currentUserKey);
    }
  }

  isLoggedIn(): boolean {
    return this._currentUser !== null;
  }

  isAdmin(): boolean {
    return this._currentUser?.tip_korisnika === 'admin';
  }

  isPravnoLice(): boolean {
    return this._currentUser?.tip_korisnika === 'pravno_lice';
  }

  isFizickoLice(): boolean {
    return this._currentUser?.tip_korisnika === 'fizicko_lice';
  }
}
