import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CurrentUserService } from '../../currentUser/service/current-user.service';

@Component({  
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnDestroy, OnInit {
   isLoggedIn = false;
   private userSub?: Subscription;
  constructor(public currentUserService: CurrentUserService,private router: Router ) {}
   ngOnInit() {
    // Pretplati se na observable da pratiš promene korisnika
    this.userSub = this.currentUserService.currentUser$.subscribe(user => {
      this.isLoggedIn = user !== null;
    });
  }
  menuOpen = false;

setMenuState(open: boolean) {
  this.menuOpen = open;
  document.body.classList.toggle('menu-open', open);
}

toggleMenu() {
  this.setMenuState(!this.menuOpen);
}

closeMenu() {
  this.setMenuState(false);
}
logout() {
  this.currentUserService.clearCurrentUser();
  // dalje možeš da obrišeš i token, ili da odradiš redirekciju:
  this.router.navigate(['/login']);
}

ngOnDestroy() {
    this.userSub?.unsubscribe();
  }
}
