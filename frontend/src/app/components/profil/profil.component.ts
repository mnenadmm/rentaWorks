import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { Subscription } from 'rxjs';
import { ReferenceService } from '../../../services/reference.service';
import { CurrentUserService } from '../../currentUser/service/current-user.service';
import { CurrentUserInterface } from '../../interfaces/current-user.interface';
import e from 'express';
@Component({
  selector: 'app-profil',
  standalone: false,
  templateUrl: './profil.component.html',
  styleUrl: './profil.component.css'
})
export class ProfilComponent implements OnInit, OnDestroy {
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
  // Na primer, možeš da prikažeš modal ili preusmeriš korisnika na neki edit profil deo
  console.log('Otvori editor biografije');
}
uploadImage() {
  if (!this.selectedFile) return;

  const formData = new FormData();
  formData.append('image', this.selectedFile);

  this.subscription = this.userService.uploadProfileImage(formData)
  .subscribe({
    next: (res)=>{
      console.log('ovo smo primili', res);
      if (this.user){
        this.user.profilna_slika = res.filename;
      }
      this.selectedFile = null;
      console.log('Profilna slika uploadovana:', res.filename)
    }, error: (err)=>{ console.error('Greška pri uploadu slike:', err);}
  })
 
  
}
  ngOnInit() {
    const id = this.currentUserService.getCurrentUser()?.id;
    if (id){
      this.userService.getKorisnikById(id).subscribe({
        next: (data) =>{
          console.log('Stigao korisnik:', data); // Ovde vidiš šta je stiglo
          this.user=data;
        },
        error: (err)=>{
          console.error('Greska pri ucitavanju profila: ',err);
        }
      });
    }else{
      console.warn('Korisnik nije prijavljen');
    }
  }
  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}