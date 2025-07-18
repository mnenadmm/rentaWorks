import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpEvent, HttpEventType  } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CurrentUserInterface } from '../app/interfaces/current-user.interface';
@Injectable({
  providedIn: 'root'
})
export class UserService {
   private apiUrl = "http://5.75.164.111:5001/api";
  constructor(private http: HttpClient) { }
  /**
   * 
   * @param id 
   * @returns vraca podatke u ulogovanom korisniku
   */
  getKorisnikById(id: number): Observable<CurrentUserInterface> {
    return this.http.get<CurrentUserInterface>(`${this.apiUrl}/korisnici/${id}`);
  }
    uploadProfileImage(formData: FormData): Observable<HttpEvent<any>> {
  const token = localStorage.getItem('token');
  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`
  });

  return this.http.post<any>(
    `${this.apiUrl}/upload_profile_image`,
    formData,
    {
      headers,
      reportProgress: true,
      observe: 'events'  // važno!
    }
  );
}
}
