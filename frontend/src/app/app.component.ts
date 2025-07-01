import { Component, OnInit } from '@angular/core';
import { CurrentUserService } from './currentUser/service/current-user.service';
import { CurrentUserInterface } from './interfaces/current-user.interface';

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  currentUser: CurrentUserInterface | null = null;

  constructor(private currentUserService: CurrentUserService) {}

  ngOnInit() {
    // Pokrećemo učitavanje korisnika sa backend-a
    this.currentUserService.loadCurrentUser();

    // Pretplatimo se na promene korisnika da dobijemo ažurirane podatke
    this.currentUserService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        console.log('Učitani korisnik:', user);
      } else {
        console.log('Nema ulogovanog korisnika');
      }
    });
  }
}
