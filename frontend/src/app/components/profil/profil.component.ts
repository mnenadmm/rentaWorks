import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { Subscription } from 'rxjs';
import { CurrentUserService } from '../../currentUser/service/current-user.service';
import { CurrentUserInterface } from '../../interfaces/current-user.interface';

@Component({
  selector: 'app-profil',
  standalone: false,
  templateUrl: './profil.component.html',
  styleUrl: './profil.component.css'
})
export class ProfilComponent implements OnInit, OnDestroy {

  uploadMessage: string | null = null;
  isSuccessMessage: boolean = true;
  private subscription?: Subscription;
  selectedFile: File | null = null;
  user: CurrentUserInterface | null = null;

  constructor(
    private userService: UserService,
    private currentUserService: CurrentUserService
  ) {}

  /** Handler za izbor fajla */
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.selectedFile = input.files[0];
    }
  }

  openBioEditor() {
    // Logika za otvaranje forme/modal-a za izmenu/dodavanje biografije
    console.log('Otvori editor biografije');
  }

  uploadImage(fileInput: HTMLInputElement) {
    if (!this.selectedFile) {
      console.error('Nema izabranog fajla!');
      return;
    }

    const formData = new FormData();
    formData.append('image', this.selectedFile); // mora biti 'image'

    this.userService.uploadProfileImage(formData).subscribe({
      next: (res) => {
        console.log('Slika uspešno uploadovana:', res.filename);
        this.uploadMessage = res.message;
        this.isSuccessMessage = true;

        // Resetuj input polje
        fileInput.value = '';
        this.selectedFile = null;

        // Osveži korisnika ako želiš da odmah vidiš novu sliku
        if (this.user) {
          const id = this.user.id;
          this.userService.getKorisnikById(id).subscribe({
            next: (data) => this.user = data
          });
        }

        // Poruku briši posle 5 sekundi
        setTimeout(() => this.uploadMessage = null, 5000);
      },
      error: (err) => {
        console.log('FormData:', [...formData.entries()]);
        console.error('Greška sa backend-a:', err);

        // Backend treba da šalje { error: '...' } za grešku
        this.uploadMessage = err.error?.error || 'Došlo je do greškeaa.';
        this.isSuccessMessage = false;

        // Poruku briši posle 5 sekundi
        setTimeout(() => this.uploadMessage = null, 5000);
      }
    });
  }

  ngOnInit() {
    const id = this.currentUserService.getCurrentUser()?.id;
    if (id) {
      this.userService.getKorisnikById(id).subscribe({
        next: (data) => {
          
          this.user = data;
        },
        error: (err) => {
          console.error('Greska pri ucitavanju profila: ', err);
        }
      });
    } else {
      console.warn('Korisnik nije prijavljen');
    }
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
