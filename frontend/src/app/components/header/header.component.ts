import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CurrentUserService } from '../../currentUser/service/current-user.service';
import { AuthenticationService } from '../../../services/authentication.service';
@Component({  
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
   isLoggedIn = false;

  constructor(public currentUserService: CurrentUserService,private router: Router ) {}
   ngOnInit() {
    this.isLoggedIn = this.currentUserService.isLoggedIn(); 
    console.log('isLoggedIn:', this.isLoggedIn); 
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
}
