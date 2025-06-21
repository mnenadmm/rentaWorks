import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders  } from '@angular/common/http';
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
    uploadProfileImage(formData: FormData): Observable<{ filename: string }> {
       const token = localStorage.getItem('token'); // ili sessionStorage.getItem('token')
   console.log('vooo je token', token)
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

  return this.http.post<{ filename: string }>(`${this.apiUrl}/upload_profile_image`, formData,{ headers });
}
}
