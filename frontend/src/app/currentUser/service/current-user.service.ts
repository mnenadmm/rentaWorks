import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CurrentUserInterface } from '../../interfaces/current-user.interface';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CurrentUserService {
  private currentUserKey = 'currentUser';
  private _currentUser: CurrentUserInterface | null = null;
  
  private currentUserSubject = new BehaviorSubject<CurrentUserInterface | null>(null);
  
  currentUser$: Observable<CurrentUserInterface | null> = this.currentUserSubject.asObservable();

  private apiUrl = 'http://5.75.164.111:5001/api'; // ili tvoj backend URL

  constructor(private http: HttpClient) {
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
private getStorageItem(key: string): string | null {
    return localStorage.getItem(key) || sessionStorage.getItem(key);
  }

  private setStorageItem(key: string, value: string) {
    localStorage.setItem(key, value);
    sessionStorage.setItem(key, value); // za svaki slučaj
  }

  private removeStorageItem(key: string) {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
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
      localStorage.removeItem('token');
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

  loadCurrentUser(): void {
  if (!this.isBrowser()) {
    // Nismo u browseru, nemoj pristupati localStorage
    return;
  }

  const token = localStorage.getItem('token');
  if (!token) {
    this.clearCurrentUser();
    return;
  }

  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });

  this.http.get<CurrentUserInterface>(`${this.apiUrl}/current-user`, { headers }).subscribe({
    next: (user) => this.setCurrentUser(user),
    error: (err) => {
      console.error('Greška prilikom učitavanja korisnika:', err);
      this.clearCurrentUser();
    }
  });
}
}
