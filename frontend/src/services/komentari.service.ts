import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
export interface Komentar {
  id: number;
  tekst: string;
  korisnik_id: number;
  korisnik_ime: string;
  profilna_slika?: string;
  created_at: string;
}
@Injectable({
  providedIn: 'root'
})
export class KomentariService {
   private apiUrl = 'http://5.75.164.111:5001/api/komentari';
  constructor(private http: HttpClient) { }
  private getAuthHeaders(): HttpHeaders {
  const token = localStorage.getItem('token');
  const headersConfig: any = { 'Content-Type': 'application/json' };
  if (token) headersConfig['Authorization'] = `Bearer ${token}`;
  return new HttpHeaders(headersConfig);
}
  getKomentari(firmaId: number): Observable<Komentar[]> {
    return this.http.get<Komentar[]>(`${this.apiUrl}/firma/${firmaId}`);
  }
  dodajKomentar(firmaId: number, tekst: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiUrl}/dodaj`,
      { firma_id: firmaId, tekst },
      { headers }
    );
  }
}
