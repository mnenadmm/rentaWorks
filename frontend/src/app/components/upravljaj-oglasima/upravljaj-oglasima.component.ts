import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { OglasiService } from '../../../services/oglasi/oglasi.service';
import { OglasiInterface } from '../../interfaces/oglasi-interface';
import { SocketService } from '../../../services/socket.service';

@Component({
  selector: 'app-upravljaj-oglasima',
  standalone: false,
  templateUrl: './upravljaj-oglasima.component.html',
  styleUrls: ['./upravljaj-oglasima.component.css']
})
export class UpravljajOglasimaComponent implements OnInit, OnDestroy {
  oglasi: OglasiInterface[] = [];
  loading = true;
  error: string | null = null;

  // Modal kontrola
  modalVisible = false;
  oglasZaBrisanje: number | null = null;

  private oglasObrisanListener = (data: { id: number }) => {
  const oglasId = data.id;
  this.oglasi = this.oglasi.filter(o => o.id !== oglasId);
  console.log(`Oglas sa ID ${oglasId} je uklonjen preko Socket-a`);
};

  constructor(
    private oglasiService: OglasiService,
    private router: Router,
    private socketService: SocketService
  ) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.ucitajMojeOglase();
      this.socketService.onOglasObrisan(this.oglasObrisanListener);
    }
  }

  private ucitajMojeOglase(): void {
    this.loading = true;
    this.error = null;
    this.oglasiService.getMojiOglasi().subscribe({
      next: (res) => {
        this.oglasi = res;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.error || 'Greška pri učitavanju oglasa.';
        this.loading = false;
      }
    });
  }

  izmeniOglas(oglas: OglasiInterface) {
    this.router.navigate(['/azuriraj-oglas', oglas.id], { state: { oglas } });
  }

  // ---- Modal funkcionalnost ----
  pokaziModal(oglasId: number): void {
    this.oglasZaBrisanje = oglasId;
    this.modalVisible = true;
  }

  zatvoriModal(): void {
    this.modalVisible = false;
    this.oglasZaBrisanje = null;
  }

  async potvrdiBrisanje(): Promise<void> {
    if (this.oglasZaBrisanje === null) return;

    // Čekamo potvrdu korisnika kroz modal
    const confirmed = await this.prikaziConfirmModal();
    if (!confirmed) return; // ako korisnik otkaže, ne radi ništa

    // Poziv backend-a tek nakon potvrde
    this.obrisiOglas(this.oglasZaBrisanje);
    this.zatvoriModal();
  }

  // Simulacija async potvrde preko modal-a
  private prikaziConfirmModal(): Promise<boolean> {
    return new Promise((resolve) => {
      // Ovde koristiš svoj modal, ali za primer:
      const confirmed = window.confirm('Da li ste sigurni da želite da obrišete oglas?');
      resolve(confirmed);
    });
  }

  private obrisiOglas(id: number): void {
    this.oglasiService.obrisiOglas(id).subscribe({
      next: (res) => {
        this.oglasi = this.oglasi.filter(o => o.id !== id);
        console.log('Server poruka:', res.message);
      },
      error: (err) => {
        const errorMessage = err.error?.error || 'Greška pri brisanju oglasa.';
        const details = err.error?.details ? ` Detalji: ${err.error.details}` : '';
        this.error = errorMessage + details;
      }
    });
  }

  ngOnDestroy(): void {
    this.socketService.offOglasObrisan(this.oglasObrisanListener);
  }
}
