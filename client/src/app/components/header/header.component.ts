import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
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

