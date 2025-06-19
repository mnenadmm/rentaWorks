import { Injectable } from '@angular/core';
import { CurrentUserInterface } from '../../interfaces/current-user.interface';

@Injectable({
  providedIn: 'root'
})
export class CurrentUserService {
  private currentUserKey = 'currentUser';
  private _currentUser: CurrentUserInterface | null = null;

  constructor() {
    if (this.isBrowser()) {
      const savedUser = localStorage.getItem(this.currentUserKey);
      if (savedUser) {
        this._currentUser = JSON.parse(savedUser);
      }
    }
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  setCurrentUser(user: CurrentUserInterface) {
    this._currentUser = user;
    if (this.isBrowser()) {
      localStorage.setItem(this.currentUserKey, JSON.stringify(user));
    }
  }

  getCurrentUser(): CurrentUserInterface | null {
    return this._currentUser;
  }

  clearCurrentUser() {
    this._currentUser = null;
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
