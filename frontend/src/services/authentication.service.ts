import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private apiUrl = "http://5.75.164.111:5001";
  readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    }),
    withCredentials: true
  };

  constructor(private http: HttpClient) { }

  register(userData: any): Observable<any> {
    // POST na backend endpoint za registraciju sa httpOptions
    return this.http.post(`${this.apiUrl}/registracija`, userData, this.httpOptions);
  }
}