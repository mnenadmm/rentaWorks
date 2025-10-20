import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { OglasiService } from '../../../services/oglasi/oglasi.service';
import { OglasiInterface } from '../../interfaces/oglasi-interface';

interface Zanimanje {
  id: number;
  naziv: string;
}

@Component({
  selector: 'app-azuriraj-oglas',
  standalone: false,
  templateUrl: './azuriraj-oglas.component.html',
  styleUrls: ['./azuriraj-oglas.component.css']
})
export class AzurirajOglasComponent implements OnInit {
  formaZaIzmenu: FormGroup;
  oglasId!: number;
  successMessage: string | null = null;
  errorMessage: string | null = null;
  svaZanimanja: Zanimanje[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private oglasiService: OglasiService
  ) {
    this.formaZaIzmenu = this.fb.group({
      opis: ['', Validators.required],
      lokacija: [''],
      datum_objave: [''],
      zanimanje_ids: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    const stateOglas = history.state.oglas as OglasiInterface;
    if (!stateOglas) {
      this.errorMessage = 'Podaci o oglasu nisu dostupni.';
      return;
    }

    this.oglasId = stateOglas.id;

    // Dohvati sva zanimanja
    this.oglasiService.dohvatiZanimanja().subscribe({
      next: (z: Zanimanje[]) => {
        this.svaZanimanja = z;

        // Patch svih polja uključujući zanimanje
        this.patchujFormu(stateOglas);
      },
      error: (err) => console.error('Greška pri dohvatanju zanimanja:', err)
    });
  }

  private patchujFormu(oglas: OglasiInterface): void {
    const zanimanjeId = this.nadjiZanimanjeId(oglas.zanimanja?.[0] || null);

    this.formaZaIzmenu.patchValue({
      opis: oglas.opis,
      lokacija: oglas.lokacija || '',
      datum_objave: oglas.datum_objave || '',
      zanimanje_ids: zanimanjeId
    });

    
  }

  private nadjiZanimanjeId(naziv: string | null): number | null {
    if (!naziv) return null;
    const z = this.svaZanimanja.find(z => z.naziv === naziv);
    return z ? z.id : null;
  }

  sacuvajIzmene(): void {
    this.successMessage = null;
    this.errorMessage = null;

    if (this.formaZaIzmenu.invalid) {
      this.errorMessage = 'Molimo popunite obavezna polja.';
      return;
    }

    const podatci: any = { ...this.formaZaIzmenu.value };

    // Backend očekuje array
    if (podatci.zanimanje_ids && !Array.isArray(podatci.zanimanje_ids)) {
      podatci.zanimanje_ids = [podatci.zanimanje_ids];
    }

    this.oglasiService.updateOglas(this.oglasId, podatci).subscribe({
      next: (res: { message: string }) => {
        this.successMessage = res.message || 'Uspešno sačuvano.';
        setTimeout(() => this.router.navigate(['/upravljaj-oglasima']), 2000);
      },
      error: (err) => {
        const errorMessage = err.error?.error || 'Greška pri čuvanju oglasa.';
        const details = err.error?.details ? ` Detalji: ${err.error.details}` : '';
        this.errorMessage = errorMessage + details;
      }
    });
  }

  back(): void {
    this.router.navigate(['/upravljaj-oglasima']);
  }
}
