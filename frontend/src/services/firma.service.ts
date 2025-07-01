import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders  } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Firma_interface } from '../app/interfaces/firma-interface';

@Injectable({
  providedIn: 'root'
})
export class FirmaService {
  private apiUrl = "http://5.75.164.111:5001/api";

  constructor(private http: HttpClient) { }
   private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }
  
  uploadLogo(firmaId: number, logoFile: File): Observable<any> {
  const token = localStorage.getItem('token') || '';
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });
  const formData = new FormData();
  formData.append('logo', logoFile);

  return this.http.post(`${this.apiUrl}/firme/${firmaId}/logo`, formData, { headers });
}
  kreirajFirmu(firma: Partial<Firma_interface>): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${this.apiUrl}/firme`, firma, { headers });
  }
  dohvatiMojuFirmu(): Observable<Firma_interface> {
  const headers = this.getAuthHeaders();
  return this.http.get<Firma_interface>(`${this.apiUrl}/moja-firma`, { headers });
}

  izlistajFirme(): Observable<Firma_interface[]> {
    return this.http.get<Firma_interface[]>(`${this.apiUrl}/firme`);
  }
}
