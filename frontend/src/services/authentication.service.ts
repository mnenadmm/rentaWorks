import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private apiUrl = "http://5.75.164.111:5001/api";
  readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    }),
    withCredentials: true
  };

  constructor(private http: HttpClient) { }
  /*
 * Prijavljuje korisnika koristeći email i lozinku.
 * @param credentials Objekt koji sadrži email i lozinku korisnika.
 *  @returns Observable koji vraća odgovor sa servera 
 */
  login(credentials: { username: string; lozinka: string }): Observable<any> {
  return this.http.post<any>(`${this.apiUrl}/login`, credentials, this.httpOptions).pipe(
    tap(response => {
      // Sačuvaj token u localStorage
      if (response.token) {
        localStorage.setItem('token', response.token);
      }
    })
  );
}
  /**
   * Registruje novog korisnika.
   * @param userData sadrzi sve podatke kojise salju serveru
   * @returns vraca poruku sa severa 
   */
  register(userData: any): Observable<any> {
    // POST na backend endpoint za registraciju sa httpOptions
    return this.http.post(`${this.apiUrl}/registracija`, userData, this.httpOptions);
  }
  /**
 * Osvežava access token koristeći refresh token (koji se šalje kao cookie).
 * @returns Observable sa novim access_token-om
 */
refreshToken(): Observable<any> {
  return this.http.post<{ access_token: string }>(
    `${this.apiUrl}/refresh`,
    {},
    {
      withCredentials: true 
    }
  ).pipe(
    tap(response => {
      if (response.access_token) {
        localStorage.setItem('token', response.access_token);
      }
    })
  );
}

  
}