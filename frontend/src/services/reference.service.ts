import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Zanimanje,Vestina,Drzava } from '../app/interfaces/reference.interface';

@Injectable({
  providedIn: 'root'
})
export class ReferenceService {
   private baseUrl = 'http://5.75.164.111:5001/api';
  constructor(private http: HttpClient) { }
    getZanimanja(): Observable<Zanimanje[]> {
    return this.http.get<Zanimanje[]>(`${this.baseUrl}/zanimanja`);
  }

  getVestine(): Observable<Vestina[]> {
    return this.http.get<Vestina[]>(`${this.baseUrl}/vestine`);
  }

  getDrzave(): Observable<Drzava[]> {
    return this.http.get<Drzava[]>(`${this.baseUrl}/drzave`);
  }

}
