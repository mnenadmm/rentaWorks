import { Component } from '@angular/core';

@Component({  
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
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
}
