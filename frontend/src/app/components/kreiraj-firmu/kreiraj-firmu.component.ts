import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Firma_interface } from '../../interfaces/firma-interface';
import { FirmaService } from '../../../services/firma.service';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-kreiraj-firmu',
  standalone: false,
  templateUrl: './kreiraj-firmu.component.html',
  styleUrls: ['./kreiraj-firmu.component.css']
})
export class KreirajFirmuComponent implements OnInit, OnDestroy {
  @ViewChild('firmaForm') firmaForm!: NgForm;

  firma: Partial<Firma_interface> = {
    naziv: '',
    pib: '',
    adresa: '',
    telefon: '',
    email: '',
    web_sajt: ''
  };

  isLoadingFirma = true;
  selectedLogo: File | null = null;
  selectedLogoName: string | null = null;
  logoUploadError: string | null = null;
  responseMessage: string | null = null;
  isSuccessMessage: boolean = true;
  isSubmitting: boolean = false;
  constructor(private firmaService: FirmaService) {}
  ngOnInit(): void {
    setTimeout(() => {
      this.isLoadingFirma = false;
    }, 500);
  }
  ngOnDestroy(): void {}
  // Korisnik može da izabere bilo koju veličinu fajla, bez provere veličine
  onLogoSelected(event: Event): void {
  event.preventDefault();
  event.stopPropagation();
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    const file = input.files[0];
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/webp', 'image/gif',
      'image/svg+xml'
    ];
    if (!allowedTypes.includes(file.type)) {
      this.logoUploadError = 'Dozvoljeni formati: JPG, PNG, WEBP, GIF, SVG.';
      this.selectedLogo = null;
      this.selectedLogoName = null;
      input.value = ''; // resetuj input da korisnik može opet da izabere fajl
      return;
    }

    this.selectedLogo = file;
    this.selectedLogoName = file.name;
    this.logoUploadError = null; // resetuj grešku ako je bilo ranije
  }
}
kreirajFirmu() {
  this.isSubmitting = true;
  this.responseMessage = null;
  this.logoUploadError = null;

  this.firmaService.kreirajFirmu(this.firma).subscribe({
    next: (res) => {
      this.responseMessage = res.message || 'Firma uspešno kreirana.';
      this.isSuccessMessage = res.success === true;
      this.isSubmitting = false;
      this.firmaForm.resetForm();

      if (this.isSuccessMessage) {
        const firmaId = res.data?.id;

        if (this.selectedLogo && firmaId) {
          this.resizeImage(this.selectedLogo, 500, 500).then(resizedBlob => {
            const resizedFile = new File(
              [resizedBlob],
              this.selectedLogoName || 'logo.jpg',
              { type: 'image/jpeg' }
            );

            this.firmaService.uploadLogo(firmaId, resizedFile).subscribe({
              next: () => {
                this.responseMessage = 'Logo uspešno dodat.';
                this.isSuccessMessage = true;
                this.selectedLogo = null;
                this.selectedLogoName = null;
                this.logoUploadError = null;
              },
              error: (err) => {
                this.logoUploadError = this.extractErrorMessage(err) || 'Greška prilikom dodavanja loga.';
                this.isSuccessMessage = false;
              }
            });
          }).catch(err => {
            this.logoUploadError = 'Greška pri obradi loga.';
            this.isSuccessMessage = false;
            console.error('Resize logo error:', err);
          });
        }

        // Reset podataka firme
        this.firma = {
          naziv: '',
          pib: '',
          adresa: '',
          telefon: '',
          email: '',
          web_sajt: ''
        };

        if (!this.selectedLogo) {
          this.selectedLogo = null;
          this.selectedLogoName = null;
          this.logoUploadError = null;
        }
      }

      setTimeout(() => {
        this.responseMessage = null;
        this.logoUploadError = null;
      }, 5000);
    },
    error: (err) => {
      this.responseMessage = this.extractErrorMessage(err) || 'Greška pri slanju podataka.';
      this.isSuccessMessage = false;
      this.isSubmitting = false;
      setTimeout(() => (this.responseMessage = null), 5000);
    }
  });
}

// Dodatna pomoćna metoda za ekstrakciju greške
private extractErrorMessage(err: any): string | null {
  if (!err) return null;
  if (err.error) {
    if (typeof err.error === 'string') {
      return err.error;
    } else if (typeof err.error === 'object') {
      return err.error.message || err.error.error || JSON.stringify(err.error);
    }
  }
  return err.message || null;
}



  // Resize slike na max 500x500 px i kompresija u jpeg kvalitet 85%
  resizeImage(file: File, maxWidth = 500, maxHeight = 500): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      const reader = new FileReader();

      reader.onload = (e: any) => {
        image.src = e.target.result;
      };

      image.onload = () => {
        const canvas = document.createElement('canvas');
        let width = image.width;
        let height = image.height;

        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(image, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Greška u konverziji slike'));
          },
          'image/jpeg',
          0.85
        );
      };

      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  }
}
