import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OglasiInterface } from '../../app/interfaces/oglasi-interface';

export interface ZanimanjeInterface {
  id: number;
  naziv: string;
}

@Injectable({
  providedIn: 'root'
})
export class OglasiService {
  private apiUrl = "http://5.75.164.111:5001/api/oglasi/";
  private apiZanimanjaUrl = "http://5.75.164.111:5001/api/zanimanja";

  constructor(private http: HttpClient) { }

  // ==================== OTVORENI OGLASI ====================
// Vraca sve oglase ili filtrirane po lokaciji/zanimanju (JAVNA RUTA)
getOglasi(filter?: { lokacija?: string, zanimanje_id?: number }): Observable<OglasiInterface[]> {
  let params = new HttpParams();
  if (filter?.lokacija) params = params.set('lokacija', filter.lokacija);
  if (filter?.zanimanje_id) params = params.set('zanimanje_id', filter.zanimanje_id.toString());
  return this.http.get<OglasiInterface[]>(this.apiUrl, { params });
}

  // ==================== ZAŠTIĆENE METODE ====================
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
   
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  kreirajOglas(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data, { headers: this.getAuthHeaders() });
  }

  updateOglas(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}${id}`, data, { headers: this.getAuthHeaders() });
  }

  obrisiOglas(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}${id}`, { headers: this.getAuthHeaders() });
  }

// Dohvatanje zanimanja (JAVNA RUTA)
dohvatiZanimanja(): Observable<ZanimanjeInterface[]> {
  return this.http.get<ZanimanjeInterface[]>(this.apiZanimanjaUrl);
}

  getMojiOglasi(): Observable<OglasiInterface[]> {
    return this.http.get<OglasiInterface[]>(`${this.apiUrl}moji-oglasi`, { headers: this.getAuthHeaders() });
  }
}
