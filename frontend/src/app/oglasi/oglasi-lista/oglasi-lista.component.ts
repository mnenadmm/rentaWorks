import { Component, OnInit, OnDestroy } from '@angular/core';
import { OglasiService, ZanimanjeInterface } from '../../../services/oglasi/oglasi.service';
import { SocketService } from '../../../services/socket.service';
import { OglasiInterface } from '../../interfaces/oglasi-interface';
import { Router } from '@angular/router';
import { CurrentUserService } from '../../currentUser/service/current-user.service';

interface OglasFilter {
  lokacija?: string;
  zanimanje_id?: number;
}

@Component({
  selector: 'app-oglasi-lista',
  templateUrl: './oglasi-lista.component.html',
  styleUrls: ['./oglasi-lista.component.css'],
  standalone: false
})
export class OglasiListaComponent implements OnInit, OnDestroy {
  oglasi: OglasiInterface[] = [];         // Lista svih oglasa
  sveLokacije: string[] = [];             // Lista svih lokacija za filter
  svaZanimanja: ZanimanjeInterface[] = []; // Lista svih zanimanja za filter
  lokacijaFilter: string = '';            // Trenutni filter za lokaciju
  zanimanjeFilter: number | '' = '';         // Trenutni filter za zanimanje
  loading: boolean = false;               // Flag za prikaz spinnera
  prikaziFiltere: boolean = false;        // Toggle prikaza filtera

  // Socket listeneri
  private noviOglasListener = (oglas: OglasiInterface) => this.oglasi.unshift(oglas);
  private oglasObrisanListener = (oglasId: number) =>
    this.oglasi = this.oglasi.filter(o => o.id !== oglasId);
  private oglasAzuriranListener = (oglas: OglasiInterface) => {
    const idx = this.oglasi.findIndex(o => o.id === oglas.id);
    if (idx !== -1) this.oglasi[idx] = oglas;
  };

  constructor(
    private oglasiService: OglasiService,
    private socketService: SocketService,
    private router: Router,
    private currentUserService: CurrentUserService
  ) {}

  /** 
   * Inicijalizacija komponente
   * - Registrujemo socket događaje
   * - Učitavamo sve oglase i zanimanja
   */
  ngOnInit(): void {
    this.socketService.onNoviOglas(this.noviOglasListener);
    this.socketService.onOglasObrisan(this.oglasObrisanListener);
    this.socketService.onOglasAzuriran(this.oglasAzuriranListener);

    this.ucitajSveOglase();
    this.ucitajZanimanja();
  }

  /** 
   * Čišćenje listenera kada komponenta bude uništena
   */
  ngOnDestroy(): void {
    this.socketService.offNoviOglas(this.noviOglasListener);
    this.socketService.offOglasObrisan(this.oglasObrisanListener);
    this.socketService.offOglasAzuriran(this.oglasAzuriranListener);
  }

  /**
   * Navigacija do stranice firme
   * @param firmaId - ID firme na koju se ide
   */
  idiNaFirmu(firmaId?: number): void {
    if (!firmaId) return;
    this.router.navigate(['/firma', firmaId], { queryParams: { povratak: 'oglasi' } });
  }

  /**
   * Učitava sve oglase bez filtera
   */
  ucitajSveOglase(): void {
    this.loading = true;
    this.oglasiService.getOglasi({}).subscribe({
      next: (data) => {
        this.oglasi = data;

        // Generišemo jedinstvene lokacije za filter
        this.sveLokacije = Array.from(
          new Set(data.map(o => o.lokacija?.trim()).filter(l => !!l) as string[])
        ).sort();

        this.loading = false;
      },
      error: (err) => {
        console.error('Greška pri učitavanju oglasa:', err);
        this.loading = false;
      }
    });
  }

  /**
   * Učitava sva zanimanja za filter
   */
  ucitajZanimanja(): void {
    this.oglasiService.dohvatiZanimanja().subscribe({
      next: (data) => {
        this.svaZanimanja = data;
        console.log('✅ Backend vratio zanimanja:', data);
      },
      error: (err) => {
        console.error('Greška pri učitavanju zanimanja:', err);
      }
    });
  }

  /**
   * Učitava oglase prema selektovanim filterima
   */
  ucitajOglase(): void {
    this.loading = true;
    const filter: OglasFilter = {};

    if (this.lokacijaFilter.trim()) {
      filter.lokacija = this.lokacijaFilter.trim();
    }

    if (this.zanimanjeFilter !== '') {
      filter.zanimanje_id = Number(this.zanimanjeFilter);
    }

    this.oglasiService.getOglasi(filter).subscribe({
      next: (data) => {
        this.oglasi = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Greška pri učitavanju filtriranih oglasa:', err);
        this.loading = false;
      }
    });
  }

  /**
   * Resetuje sve filtere i ponovo učitava oglase
   */
  resetFilter(): void {
    this.lokacijaFilter = '';
    this.zanimanjeFilter = '';
    this.ucitajOglase();
  }
}
