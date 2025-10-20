import { Component, OnInit , OnDestroy} from '@angular/core';
import { CurrentUserService } from './currentUser/service/current-user.service';
import { CurrentUserInterface } from './interfaces/current-user.interface';
import { SocketService } from '../services/socket.service';
@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, OnDestroy {
  currentUser: CurrentUserInterface | null = null;

  constructor(private currentUserService: CurrentUserService,private socketService: SocketService) {}

 ngOnInit() {
  
    // Pretplatimo se na BehaviorSubject da odmah dobijemo korisnika
    this.currentUserService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if(user){
           if (user && !this.socketService.isConnected()) {
        // Pokreni socket tek nakon što je user učitan
        this.socketService.connect();
         }
      }
      
    
    });

    // Pokreni učitavanje korisnika sa backend-a
    this.currentUserService.loadCurrentUser();
     // Socket konekcija se pravi samo jednom za celu aplikaciju
    
  }
 ngOnDestroy(): void {
    // Opcionalno, zatvori konekciju prilikom gašenja aplikacije
    this.socketService.disconnect?.();
  }
 
}
