import { Component,HostListener, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from "./components/header/header.component";
import { FooterComponent } from "./components/footer/footer.component";
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],  // ispravljeno ovde
  imports: [RouterModule,HeaderComponent, FooterComponent]
})
export class AppComponent implements OnInit  {
  title = 'client';
  setAppContainerHeight() {
    const appContainer = document.querySelector('.app-container') as HTMLElement;
    if (appContainer) {
      // koristi window.innerHeight za stvarnu visinu vidljivog dela ekrana
      appContainer.style.height = `${window.innerHeight}px`;
    }
  }
  @HostListener('window:resize')
  onResize() {
    this.setAppContainerHeight();
  }
  @HostListener('window:orientationchange')
  onOrientationChange() {
    this.setAppContainerHeight();
  }
  ngOnInit() {
    this.setAppContainerHeight();
  }
}
