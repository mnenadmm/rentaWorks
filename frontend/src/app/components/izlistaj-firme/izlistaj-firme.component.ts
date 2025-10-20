import { Component, OnInit } from '@angular/core';
import { FirmaService } from '../../../services/firma.service';
import { Firma_interface } from '../../interfaces/firma-interface';
import { Router } from '@angular/router';
@Component({
  selector: 'app-izlistaj-firme',
  standalone: false,
  templateUrl: './izlistaj-firme.component.html',
  styleUrl: './izlistaj-firme.component.css'
})
export class IzlistajFirmeComponent implements OnInit{
    firme: Firma_interface[] = [];
    loading: boolean = false;
    errorMessage: string | null = null;
    constructor(private firmaService: FirmaService,private router: Router,) {}
     
    // Funkcija za preusmeravanje na detalje firme
    idiNaFirmu(firmaId?: number) { 
    if (!firmaId) return; // zaštita
    this.router.navigate(['/firma', firmaId], { queryParams: { povratak: 'firme' } });
  }
  ngOnInit():void{
    this.ucitajFirme()
  }
  searchTerm: string = '';

filteredFirme() {
  if (!this.searchTerm) {
    return this.firme;
  }
  return this.firme.filter(firma =>
    firma.naziv.toLowerCase().includes(this.searchTerm.toLowerCase())
  );
}
ucitajFirme(): void {
  this.loading = true;
  this.errorMessage = null;

  this.firmaService.izlistajFirme().subscribe({
    next: (response) => {
      this.firme = response;
      console.log(response)
      this.loading = false;
    },
    error: (error) => {
      console.error('Greška pri učitavanju firmi:', error);

      if (error.error) {
        if (typeof error.error === 'string') {
          this.errorMessage = error.error;
        } else if (typeof error.error === 'object') {
          this.errorMessage = error.error.message || error.error.error || 'Greška pri učitavanju firmi. Pokušajte ponovo kasnije.';
        } else {
          this.errorMessage = 'Greška pri učitavanju firmi. Pokušajte ponovo kasnije.';
        }
      } else if (error.message) {
        this.errorMessage = error.message;
      } else {
        this.errorMessage = 'Greška pri učitavanju firmi. Pokušajte ponovo kasnije.';
      }

      this.loading = false;
    }
  });
}
}
