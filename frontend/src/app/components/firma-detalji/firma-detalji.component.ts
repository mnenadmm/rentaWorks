import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FirmaService } from '../../../services/firma.service';
import { Firma_interface } from '../../interfaces/firma-interface';
import { OcenaService } from '../../../services/ocena.service';
import { Komentar,KomentariService } from '../../../services/komentari.service';
@Component({
  selector: 'app-firma-detalji',
  standalone: false,
  templateUrl: './firma-detalji.component.html',
  styleUrls: ['./firma-detalji.component.css']
})
export class FirmaDetaljiComponent implements OnInit {
  firma: Firma_interface | null = null;
  loading = true;
  errorMessage: string | null = null;
  oceniVidljivo: boolean = false;
  userOcena = 0;
  povratak: string | null = null;
  komentari: Komentar[] = [];
  noviKomentarTekst: string = '';
  komentarModalVidljiv: boolean = false;
  sviKomentari: boolean = false;
  // Za modal za sve komentare
  sviKomentariModalVidljiv: boolean = false;
  // Za modal za dodavanje komentara
  dodajKomentarModalVidljiv: boolean = false;
  mozeOceni: boolean = false;
porukaOcene: string = '';
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private firmaService: FirmaService,
    private ocenaService : OcenaService,
    private komentariService : KomentariService
  ) {}

  ngOnInit(): void {
  const firmaId = this.route.snapshot.paramMap.get('id');
  if (!firmaId) {
    this.errorMessage = 'ID firme nije naveden.';
    this.loading = false;
    return;
  }

  this.povratak = this.route.snapshot.queryParamMap.get('povratak');

  this.firmaService.getFirmaPoId(+firmaId).subscribe({
    next: (f) => {
      this.firma = f;
      this.loading = false;

      // Sada kada imamo firmu, učitaj komentare
      this.ucitajKomentare(f.id!)
      // PROVERA: da li korisnik može da oceni firmu
      this.ocenaService.mozeDaOceni('firma', f.id!).subscribe({
        next: (res) => {
          this.mozeOceni = res.moze;             // kontrola zvezdica/modal-a
          this.porukaOcene = res.poruka || '';   // poruka ako ne može da oceni
        },
        error: (err) => {
          console.error('Greška pri proveri statusa ocene:', err);
          this.mozeOceni = false;
          this.porukaOcene = 'Ne mogu da proverim status ocene.';
        }
      });
    },
    error: (err) => {
      this.errorMessage = 'Greška pri učitavanju firme.';
      this.loading = false;
    }
  });
}
ucitajKomentare(firmaId: number) {
  this.komentariService.getKomentari(firmaId).subscribe({
    next: (koms: Komentar[]) => {
      this.komentari = koms.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    },
    error: (err) => {
      console.error('Greška pri učitavanju komentara:', err);
    }
  });
}
prikaziSveKomentare() {
  // npr. možeš otvoriti modal ili proširiti listu
  this.sviKomentari = true;
}
otvoriDodajKomentarModal(): void {
  this.dodajKomentarModalVidljiv = true;
  this.noviKomentarTekst = '';
}
zatvoriDodajKomentarModal(): void {
  this.dodajKomentarModalVidljiv = false;
  this.noviKomentarTekst = '';
}
otvoriSveKomentareModal(): void {
  this.sviKomentariModalVidljiv = true;
}

zatvoriSveKomentareModal(): void {
  this.sviKomentariModalVidljiv = false;
}
posaljiKomentar() {
    if (!this.noviKomentarTekst.trim()) {console.warn('Komentar je prazan');return;}
    if (!this.firma?.id) {console.error('Firma nema ID, ne može se poslati komentar');return;}
    //Pozivs servisa za slanje komentara
    this.komentariService.dodajKomentar(this.firma.id, this.noviKomentarTekst).subscribe({
      next: (noviKom : Komentar)=>{
            // Dodajemo novi komentar na vrh liste
          this.komentari.unshift(noviKom);
          console.log(noviKom)
          // Resetujemo polje za unos i zatvaramo modal
          this.noviKomentarTekst = '';
          this.dodajKomentarModalVidljiv = false; 
          
      
      },error:(err)=>{
          console.error('Greška pri slanju komentara:', err);

      }
    })
}
 otvoriModal(): void {
  console.log('Otvaram modal'); // test
  this.oceniVidljivo = true;
}
// ZATVARA modal
zatvoriModal() {
  this.oceniVidljivo = false;
}


  // Postavljanje ocene korisnika
posaljiOcenu() {
  if (!this.userOcena) {
    console.warn('Nije izabrana ocena');
    return;
  }

  if (!this.firma?.id) {
    console.error('Firma nema ID, ne može se poslati ocena');
    return;
  }

  this.ocenaService.posaljiOcenu('firma', this.firma.id, this.userOcena).subscribe({
    next: (res) => {
      console.log('Ocena uspešno poslata:', res);

      // Opcionalno: odmah osveži prosečnu ocenu i broj ocena u UI
      if (res.prosecna_ocena !== undefined) {
        this.firma!.prosecna_ocena = res.prosecna_ocena;
        this.firma!.broj_ocena = res.broj_ocena ?? this.firma!.broj_ocena;
      }
       // 🔹 Odmah onemogući ponovni unos
      this.mozeOceni = false;
      this.porukaOcene = 'Već ste ocenili ovu firmu.';
    },
    error: (err) => {
      console.error('Greška pri slanju ocene:', err);
    },
    complete: () => {
      this.oceniVidljivo = false; // zatvaranje modala nakon slanja
    }
  });
}
idiNaProfil(korisnikId: number): void {
  if (!korisnikId) {
    console.error('Korisnik nema ID');
    return;
  }
  this.router.navigate(['/korisnici', korisnikId]);
  console.log('Korisnik',korisnikId );
}
  // Navigacija nazad
  nazad(): void {
    if (this.povratak === 'oglasi') {
      this.router.navigate(['/oglasi']);
    } else {
      this.router.navigate(['/listaFirmi']);
    }
  }
}
