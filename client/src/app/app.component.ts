import { Component, HostListener, AfterViewInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from "./components/header/header.component";
import { FooterComponent } from "./components/footer/footer.component";
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone:false,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
 
})
export class AppComponent implements AfterViewInit {
  title = 'client';

  setAppContainerHeight() {
    // Provera da li se izvršavamo u browseru
    if (typeof document !== 'undefined' && typeof window !== 'undefined') {
      const appContainer = document.querySelector('.app-container') as HTMLElement;
      if (appContainer) {
        appContainer.style.height = `${window.innerHeight}px`;
      }
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

  ngAfterViewInit() {
    this.setAppContainerHeight();
  }
}
