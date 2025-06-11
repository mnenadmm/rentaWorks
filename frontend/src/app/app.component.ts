import { Component, HostListener, AfterViewInit } from '@angular/core';


@Component({
  selector: 'app-root',
  standalone:false,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
 
})
export class AppComponent implements AfterViewInit {

  setAppContainerHeight() {
    if (typeof window !== 'undefined') {
      const appHeight = window.innerHeight + 'px';
      document.documentElement.style.setProperty('--app-height', appHeight);
      console.log('Visina app-container postavljena na:', appHeight);
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