import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FirmaService } from '../../../services/firma.service';
import { Router } from '@angular/router';
import { Firma_interface } from '../../interfaces/firma-interface';

@Component({
  selector: 'app-firma-izmena',
  standalone: false,
  templateUrl: './firma-izmena.component.html',
  styleUrls: ['./firma-izmena.component.css']
})
export class FirmaIzmenaComponent implements OnInit {
  formaZaIzmenu: FormGroup;
  successMessage: string | null = null;
  errorMessage: string | null = null;
  selectedLogoFile: File | null = null;
  loadingFirma: boolean = true; // Da znamo kada učitavanje traje

  constructor(
    private fb: FormBuilder,
    private firmaService: FirmaService,
    private router: Router
  ) {
    this.formaZaIzmenu = this.fb.group({
      naziv: ['', Validators.required],
      pib: ['', Validators.required],
      adresa: [''],
      telefon: [''],
      email: ['', Validators.email],
      web_sajt: [''],
      logo_url: ['']
    });
  }

  ngOnInit(): void {
    // Proverimo da li imamo state iz navigacije
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state as { firma: Firma_interface };

    if (state?.firma) {
      // Ako postoji state, odmah popunimo formu
      this.popuniFormu(state.firma);
      this.loadingFirma = false;
    } else {
      // Ako nema state, učitavamo firmu sa backend-a
      this.firmaService.dohvatiMojuFirmu().subscribe({
        next: (res: any) => {
          this.loadingFirma = false;
          if (res.firma) {
            this.popuniFormu(res.firma);
          } else {
            this.errorMessage = 'Nemate registrovanu firmu.';
          }
        },
        error: (err) => {
          this.loadingFirma = false;
          this.errorMessage = err.error?.error || 'Greška pri učitavanju firme.';
        }
      });
    }
  }

  // Pomoćna funkcija za popunjavanje forme
  private popuniFormu(firma: Firma_interface) {
    this.formaZaIzmenu.patchValue({
      naziv: firma.naziv,
      pib: firma.pib,
      adresa: firma.adresa || '',
      telefon: firma.telefon || '',
      email: firma.email || '',
      web_sajt: firma.web_sajt || '',
      logo_url: firma.logo_url || ''
    });
  }

  onLogoSelected(event: Event) {
    event.preventDefault();
    event.stopPropagation();

    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedLogoFile = input.files[0];
    }
  }

  back(): void {
    this.router.navigate(['/mojaFirma']);
  }

  sacuvajIzmene(): void {
    if (!this.formaZaIzmenu.valid) {
      this.errorMessage = "Molimo popunite obavezna polja.";
      return;
    }

    const formData = new FormData();
    formData.append('naziv', this.formaZaIzmenu.get('naziv')?.value || '');
    formData.append('pib', this.formaZaIzmenu.get('pib')?.value || '');
    formData.append('adresa', this.formaZaIzmenu.get('adresa')?.value || '');
    formData.append('telefon', this.formaZaIzmenu.get('telefon')?.value || '');
    formData.append('email', this.formaZaIzmenu.get('email')?.value || '');
    formData.append('web_sajt', this.formaZaIzmenu.get('web_sajt')?.value || '');

    if (this.selectedLogoFile) {
      formData.append('logo_fajl', this.selectedLogoFile, this.selectedLogoFile.name);
    } else {
      formData.append('logo_url', this.formaZaIzmenu.get('logo_url')?.value || '');
    }

    this.firmaService.updateFirma(formData).subscribe({
      next: (res) => {
        this.successMessage = res.message || 'Uspešno sačuvano.';
        this.errorMessage = null;
        this.selectedLogoFile = null;

        setTimeout(() => {
          this.successMessage = null;
          this.router.navigate(['/mojaFirma']);
        }, 2000);
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Greška pri čuvanju firme.';
      }
    });
  }
}
