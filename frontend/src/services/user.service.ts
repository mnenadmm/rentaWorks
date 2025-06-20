import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CurrentUserInterface } from '../app/interfaces/current-user.interface';
@Injectable({
  providedIn: 'root'
})
export class UserService {
   private apiUrl = "http://5.75.164.111:5001/api";
  constructor(private http: HttpClient) { }
  getKorisnikById(id: number): Observable<CurrentUserInterface> {
    return this.http.get<CurrentUserInterface>(`${this.apiUrl}/korisnici/${id}`);
  }
}
