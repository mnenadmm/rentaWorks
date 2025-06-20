import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { Subscription } from 'rxjs';
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
    user: CurrentUserInterface | null = null;
    constructor(
    private userService: UserService,
    private currentUserService: CurrentUserService
  ) {}
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