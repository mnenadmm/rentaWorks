import { Component, OnInit } from '@angular/core';
import { FirmaService } from '../../../services/firma.service';
import { Firma_interface } from '../../interfaces/firma-interface';
import { Router } from '@angular/router';
import { error } from 'console';
@Component({
  selector: 'app-moja-firma',
  standalone: false,
  templateUrl: './moja-firma.component.html',
  styleUrls: ['./moja-firma.component.css']
})
export class MojaFirmaComponent implements OnInit{
  firmaPostoji: boolean | null = null; // null dok čekamo backend
  firma: Firma_interface | null = null;
  errorMessage: string | null = null;
  loadingFirma: boolean = true;
  constructor(private firmaService: FirmaService,private router: Router){};
 ngOnInit(): void {
  this.firmaService.dohvatiMojuFirmu().subscribe({
    next: (res: any) => {
      this.loadingFirma = false;
      if (res.firma) {
        this.firma = res.firma;
        this.firmaPostoji = true;
        console.log('a', res.firma)
        
      } else {
        this.firmaPostoji = false;
      }
    },
    error: (err) => {
      this.loadingFirma = false;
      this.firmaPostoji = false;
      this.errorMessage = err.error?.error || 'Greška pri učitavanju firme.';
    }
  });
}

azurirajFirmu() {
    // Prosleđivanje stanja za firmu
    if (this.firma) {
      this.router.navigate(['/moja-firma/izmena'], { state: { firma: this.firma } });
    }
  }
kreirajOglas() {
  this.router.navigate(['/oglasi/dodaj']);
}
upravljajOglasima() {
  console.log('ok')
  this.router.navigate(['/upravljaj-oglasima']);
}
}
