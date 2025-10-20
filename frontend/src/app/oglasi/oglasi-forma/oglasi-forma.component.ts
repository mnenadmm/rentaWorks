import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { OglasiService } from '../../../services/oglasi/oglasi.service';
import { CurrentUserService } from '../../currentUser/service/current-user.service';

interface Zanimanje {
  id: number;
  naziv: string;
}

@Component({
  selector: 'app-oglasi-forma',
  standalone: false,
  templateUrl: './oglasi-forma.component.html',
  styleUrls: ['./oglasi-forma.component.css']
})
export class OglasiFormaComponent implements OnInit {
  oglasForm!: FormGroup;
  uspeh = false;
  greska: string | null = null;
  nazivFirme: string | null = null;
  svaZanimanja: Zanimanje[] = [];
  showChat: boolean = false;

toggleChat() {
  this.showChat = !this.showChat;
}
  constructor(
    private fb: FormBuilder,
    private oglasiService: OglasiService,
    private currentUserService: CurrentUserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // 1️⃣ Inicijalizuj formu
    this.oglasForm = this.fb.group({
      opis: ['', Validators.required],
      lokacija: [''],
      datum_objave: [''],
      zanimanje_ids: [null, Validators.required] // single select
    });

    // 2️⃣ Dohvati naziv firme
    const firma = this.currentUserService.getPrvaFirma();
    this.nazivFirme = firma ? firma.naziv : null;

    // 3️⃣ Dohvati zanimanja
    if (typeof window !== 'undefined') {
      this.oglasiService.dohvatiZanimanja().subscribe({
        next: (z: Zanimanje[]) => this.svaZanimanja = z,
      
      });
    }
  }

  korakNazad(): void {
    this.router.navigate(['/mojaFirma']);
  }

  posaljiOglas(): void {
    if (this.oglasForm.invalid) return;

    const podatci: any = { ...this.oglasForm.value };

    // Ukloni prazne vrednosti
    if (!podatci.datum_objave) delete podatci.datum_objave;
    if (!podatci.zanimanje_ids) {
      // Backend očekuje array, ako nije izabrano, pošalji prazan array
      podatci.zanimanje_ids = [];
    } else if (!Array.isArray(podatci.zanimanje_ids)) {
      // Ako je select single, konvertuj u array
      podatci.zanimanje_ids = [podatci.zanimanje_ids];
    }

    this.oglasiService.kreirajOglas(podatci).subscribe({
      next: () => {
        this.uspeh = true;
        this.greska = null;
        this.oglasForm.reset({ zanimanje_ids: null });
        setTimeout(() => this.router.navigate(['/mojaFirma']), 2000);
      },
      error: (err) => {
        this.uspeh = false;
        this.greska = 'Greška pri slanju oglasa: ' + (err.error?.message || err.message);
      }
    });
  }
}
