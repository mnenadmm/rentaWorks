import { Component ,OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { Router } from '@angular/router';
import { CurrentUserInterface } from '../../interfaces/current-user.interface';
@Component({
  selector: 'app-user-detalji',
  standalone: false,
  templateUrl: './user-detalji.component.html',
  styleUrl: './user-detalji.component.css'
})
export class UserDetaljiComponent {
  user: CurrentUserInterface | null = null;
  loading: boolean = false;
  errorMessage: string | null = null;
  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
     private router: Router
  ){}
  ngOnInit(): void {
     const userId = Number(this.route.snapshot.paramMap.get('id'));
    if (userId) {
      this.loadUser(userId);
    } else {
      this.errorMessage = 'ID korisnika nije validan.';
    }
  }
  openChat(userId: number) {
  // Navigacija do chat prozora za tog korisnika
  this.router.navigate(['/chat', userId]);
}
  loadUser(id: number) {
    this.loading = true;
    this.errorMessage = null;
    this.userService.getKorisnikById(id).subscribe({
      next: (data) => {
        this.user = data;
        this.loading = false;
        console.log(data)
      },
      error: (err) => {
        this.errorMessage = err?.error?.description || 'Korisnik nije pronađen.';
        this.loading = false;
      }
    });
  }
   nazad() {
    window.history.back();
  }
}// kraj
