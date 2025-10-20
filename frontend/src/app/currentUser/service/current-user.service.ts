import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CurrentUserInterface } from '../../interfaces/current-user.interface';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CurrentUserService {

  /** Ključ za čuvanje trenutnog korisnika u localStorage */
  private currentUserKey = 'currentUser';

  /** Interna promenljiva koja drži trenutnog korisnika */
  private _currentUser: CurrentUserInterface | null = null;

  /** BehaviorSubject za emitovanje promena korisnika kroz aplikaciju */
  private currentUserSubject = new BehaviorSubject<CurrentUserInterface | null>(null);

  /** Observable koji se pretplaćuje u komponentama da dobije ažuriranja korisnika */
  currentUser$: Observable<CurrentUserInterface | null> = this.currentUserSubject.asObservable();

  /** URL backend API-ja */
  private apiUrl = 'http://5.75.164.111:5001/api';

  constructor(private http: HttpClient) {
    // Pri pokretanju proveravamo da li već postoji sačuvan korisnik u localStorage
    if (this.isBrowser()) {
      const savedUser = localStorage.getItem(this.currentUserKey);
      if (savedUser) {
        this._currentUser = JSON.parse(savedUser);
        this.currentUserSubject.next(this._currentUser);
      }
    }
  }

  /** Proverava da li se kod izvršava u browseru */
  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  /** Centralizovana metoda za čuvanje ili brisanje trenutnog korisnika */
  private saveCurrentUser(user: CurrentUserInterface | null) {
    this._currentUser = user;
    this.currentUserSubject.next(user);

    if (this.isBrowser()) {
      if (user) {
        localStorage.setItem(this.currentUserKey, JSON.stringify(user));
      } else {
        localStorage.removeItem(this.currentUserKey);
      }
    }
  }

  /** Postavi trenutnog korisnika */
  setCurrentUser(user: CurrentUserInterface) {
    this.saveCurrentUser(user);
  }
/** Vrati ID trenutnog korisnika ili null ako nije ulogovan */
getUserId(): number | null {
  return this._currentUser?.id || null;
}
  /** Vrati trenutnog korisnika */
  getCurrentUser(): CurrentUserInterface | null {
    return this._currentUser;
  }

  /** Obriši trenutno ulogovanog korisnika */
  clearCurrentUser() {
    this.saveCurrentUser(null);
    localStorage.removeItem('token'); // ukloni token takođe
  }

  /** Proverava da li korisnik ima bar jednu firmu */
  hasFirma(): boolean {
    return !!this._currentUser?.ima_firmu;
  }

  /** Vrati listu firmi korisnika (trenutno prazno dok backend ne pošalje stvarne firme) */
  getFirme(): { id: number; naziv: string; logo?: string }[] {
    return this._currentUser?.firme || [];
  }

  /** Vrati prvu firmu korisnika ili null ako nema firmi */
  getPrvaFirma(): { id: number; naziv: string; logo?: string } | null {
    return this._currentUser?.firme?.[0] || null;
  }

  /** Status: da li je korisnik ulogovan */
  isLoggedIn(): boolean {
    return this._currentUser !== null;
  }

  /** Status: admin korisnik */
  isAdmin(): boolean {
    return this._currentUser?.tip_korisnika === 'admin';
  }

  /** Status: pravno lice */
  isPravnoLice(): boolean {
    return this._currentUser?.tip_korisnika === 'pravno_lice';
  }

  /** Status: fizicko lice */
  isFizickoLice(): boolean {
    return this._currentUser?.tip_korisnika === 'fizicko_lice';
  }

  /** Učitavanje trenutnog korisnika sa backend-a */
  loadCurrentUser(): void {
    if (!this.isBrowser()) return;

    const token = localStorage.getItem('token');
    if (!token) {
      this.clearCurrentUser();
      return;
    }

    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.get<CurrentUserInterface>(`${this.apiUrl}/current-user`, { headers }).subscribe({
      next: (user) => this.setCurrentUser(user),
      error: (err) => {
        console.error('Greška prilikom učitavanja korisnika:', err);
        this.clearCurrentUser();
      }
    });
  }
}
