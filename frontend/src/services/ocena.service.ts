import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
export type OcenaTip = 'firma' | 'radnik';
@Injectable({
  providedIn: 'root'
})
export class OcenaService {
  private apiUrl = "http://5.75.164.111:5001/api";
  constructor(private http: HttpClient) { }
  // 🔒 Privatna metoda koja dodaje token u header
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }
     // 📤 Generičko slanje ocene za firmu ili radnika
  posaljiOcenu(tip: OcenaTip, id: number, ocena: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${this.apiUrl}/${tip}/${id}/ocena`, { ocena }, { headers });
  }
  // ✅ Nova metoda: Proverava da li korisnik može da oceni entitet (npr. firmu)
  mozeDaOceni(tip: OcenaTip, id: number): Observable<{ moze: boolean, poruka?: string }> {
  const headers = this.getAuthHeaders();
  return this.http.get<{ moze: boolean, poruka?: string }>(
    `${this.apiUrl}/${tip}/${id}/moze-da-oceni`,
    { headers }
  );
}


}
