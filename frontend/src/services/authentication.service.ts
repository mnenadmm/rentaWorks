import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
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
  login(credentials: { email: string; password: string }): Observable<any> {
  return this.http.post(`${this.apiUrl}/login`, credentials, this.httpOptions);
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
}