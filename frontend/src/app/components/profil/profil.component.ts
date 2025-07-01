import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { UserService } from '../../../services/user.service';
import { CurrentUserService } from '../../currentUser/service/current-user.service';
import { CurrentUserInterface } from '../../interfaces/current-user.interface';

@Component({
  selector: 'app-profil',
  standalone: false,
  templateUrl: './profil.component.html',
  styleUrls: ['./profil.component.css']  
})
export class ProfilComponent implements OnInit, OnDestroy {
  uploadProgress: number | null = null;
  uploadMessage: string | null = null;
  isSuccessMessage: boolean = true;
  selectedFile: File | null = null;
  user: CurrentUserInterface | null = null;
  debugLog: string[] = [];
  isUploading: boolean = false;
  isLoadingUser: boolean = false;
  isEditingBio: boolean = false; 

  constructor(
    private userService: UserService,
    private currentUserService: CurrentUserService
  ) {}

  ngOnInit() {
    const currentUser = this.currentUserService.getCurrentUser();
    if (currentUser?.id) {
      this.loadUser(currentUser.id);
    } else {
      console.warn('Korisnik nije prijavljen');
    }
  }
  ngOnDestroy(): void {}
  onFileSelected(event: Event) {
    event.preventDefault(); // <-- Dodaj ovo za svaki slučaj
    event.stopPropagation();
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      const file = input.files[0];
      const allowedTypes = [
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'image/heic', 'image/heif', 'image/bmp', 'image/tiff',
  'image/svg+xml', 'image/x-icon', 'image/vnd.microsoft.icon',
  'image/x-png', 'image/x-bmp'
];
      if (!allowedTypes.includes(file.type)) {
        this.uploadMessage = 'Dozvoljeni su fajlovi: JPG, JPEG, PNG, WEBP, GIF, HEIC, HEIF, BMP, TIFF, SVG, ICO.';
        this.isSuccessMessage = false;
        this.selectedFile = null;
        input.value = '';
        setTimeout(() => (this.uploadMessage = null), 5000);
        return;
      }
      this.selectedFile = file;
     console.log('Odabrani fajl:', file);
    }
  }
  uploadImage(fileInput: HTMLInputElement) {
    if (!this.selectedFile) return;
    this.isUploading = true;
    this.uploadProgress = 0;
    this.uploadMessage = null;
    this.resizeImage(this.selectedFile).then((resizedBlob) => {
      const formData = new FormData();
      formData.append('image', resizedBlob, 'resized.jpg');
      this.userService.uploadProfileImage(formData).subscribe({
        next: (event: HttpEvent<any>) => {
          if (event.type === HttpEventType.UploadProgress && event.total) {
            this.uploadProgress = Math.round(100 * event.loaded / event.total);
          } else if (event.type === HttpEventType.Response) {
            const res = event.body;
            
            this.uploadMessage = res.message || res.error || null;
            this.isSuccessMessage = res.success === true;
            this.selectedFile = null;
            fileInput.value = '';
            this.isUploading = false;
            setTimeout(() => (this.uploadProgress = null), 1000);
            setTimeout(() => (this.uploadMessage = null), 5000);
            const currentUser = this.currentUserService.getCurrentUser();
            if (currentUser?.id) this.loadUser(currentUser.id);
          }
        },
        error: (err) => {
          this.isUploading = false;
          this.uploadProgress = null;
          alert(err?.error?.message || err?.message || 'Greška prilikom uploada');
          console.error('Upload error raw:', err);
          if (err.error) {
            if (typeof err.error === 'object') {
              this.uploadMessage = err.error.error || err.error.message || null;
            } else if (typeof err.error === 'string') {
              this.uploadMessage = err.error;
            }
          } else if (err.message) {
            this.uploadMessage = err.message;
          } else {
            this.uploadMessage = null;
          }
          this.isSuccessMessage = false;
          setTimeout(() => (this.uploadMessage = null), 5000);
        }
      });
    }).catch(err => {
      this.isUploading = false;
      this.uploadProgress = null;
      this.uploadMessage = 'Greška pri obradi slike. Proverite da li ste izabrali validnu sliku.';
      this.isSuccessMessage = false;
      console.error('Greška prilikom resize-ovanja slike:', err);
      setTimeout(() => (this.uploadMessage = null), 5000);
    });
  }
  loadUser(id: number) {
    this.isLoadingUser = true;
    this.userService.getKorisnikById(id).subscribe({
      next: (data) => {
        this.user = data;
        this.isLoadingUser = false;
      },
      error: (err) => {
        console.error('Greška pri učitavanju profila: ', err);
        this.isLoadingUser = false;
      }
    });
  }
  resizeImage(file: File, maxWidth = 1024, maxHeight = 1024): Promise<Blob> {
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

  // ✅ Nova logika: otvori editor biografije
  openBioEditor() {
    this.isEditingBio = true;
    console.log('Otvori editor biografije');
  }
  // Opcionalno: zatvori editor
  closeBioEditor() {
    this.isEditingBio = false;
  }
}
