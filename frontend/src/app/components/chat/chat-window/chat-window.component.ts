// chat-window.component.ts
import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CurrentUserService } from '../../../currentUser/service/current-user.service';
import { SocketService, ChatMessage } from '../../../../services/socket.service';
import { Subscription } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
@Component({
  selector: 'app-chat-window',
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.css'],
  standalone: false
})
export class ChatWindowComponent implements OnInit, OnDestroy {
  @ViewChild('chatBody') chatBody!: ElementRef;
  userId!: number;
  currentUserId!: number;
  user: any;
  poruke: ChatMessage[] = [];
  novaPoruka: string = '';
  loading: boolean = true;
  userTyping: boolean = false;
  private currentUserSub!: Subscription;
   private apiUrl = 'http://5.75.164.111:5001/api/chat';
  constructor(
    private route: ActivatedRoute,
    private currentUserService: CurrentUserService,
    private socketService: SocketService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.currentUserService.getUserId() ?? 0;
    this.route.params.subscribe(params => {
      this.userId = +params['id'];
      this.ucitajKorisnika();
    });
    //Pozivamo slusalac za tipkanje
   this.socketService.onTyping(this.handleTyping);
    // Slušamo nove poruke
  this.socketService.onNovaPoruka(this.handleNovaPoruka);
    
   
  }

  // ==================== Handleri ====================
  private handleNovaPoruka = (msg: ChatMessage) => {
    const isRelevant = msg.from_user === this.userId || msg.to_user === this.userId;
    if (!isRelevant) return;
    const nova: ChatMessage = {
      ...msg,
      role: msg.from_user === this.currentUserId ? 'assistant' : 'user'
    };
    this.poruke.push(nova);
    this.scrollToBottom();
  }
// Hendler za status tipkanja
  private handleTyping = (data: { userId: number; status: string }) => {
  this.userTyping = data.userId === this.userId && data.status === 'typing';
};

 

  // ==================== Učitavanje korisnika ====================
 ucitajKorisnika(): void {
  // Pokušaj prvo da uzmeš korisnika iz servisa (ako je već učitan)
  const currentUser = this.currentUserService.getCurrentUser();
  if (currentUser) {
    this.user = currentUser;
    this.loading = false;
    return;
  }

  // Ako korisnik nije u servisu, pozovi backend da ga učita
  this.currentUserService.loadCurrentUser();

  // Pretplati se na promene korisnika (asinkrono) i sačuvaj Subscription
  this.currentUserSub = this.currentUserService.currentUser$.subscribe(user => {
    if (user) {
      this.user = user;
      this.loading = false;
      this.ucitajIstoriju();
  return;
    }
  });
}
korisnikTipka(): void {
  this.socketService.emitTypingStatus(this.userId, 'typing');
}
  // ==================== Slanje poruke ====================
  posaljiPoruku(): void {
    if (!this.novaPoruka.trim()) return;

    const poruka: ChatMessage = {
      from_user: this.currentUserId,
      to_user: this.userId,
      content: this.novaPoruka,
      created_at: new Date().toISOString(),
      role: 'user'
    };

    this.poruke.push(poruka);
    this.scrollToBottom();

    this.socketService.posaljiPoruku(poruka);

     // Signaliziraj da je korisnik završio sa tipkanjem
  this.socketService.emitTypingStatus(this.userId, 'stopped');

    this.novaPoruka = '';
  }

  // ==================== Scroll ====================
  scrollToBottom(): void {
    setTimeout(() => {
      try {
        this.chatBody.nativeElement.scrollTop = this.chatBody.nativeElement.scrollHeight;
      } catch {}
    }, 50);
  }
  // ==================== Učitavanje istorije poruka ====================
  ucitajIstoriju(): void {
    const token = localStorage.getItem('token');
    if (!token) return;

    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.get<{ history: ChatMessage[] }>(`${this.apiUrl}/history/${this.userId}`, { headers })
  .subscribe({
    next: (res) => {
      this.poruke = res.history.map(msg => ({
        ...msg,
        role: msg.from_user === this.currentUserId ? 'assistant' : 'user'
      }));
      this.scrollToBottom();
    },
    error: (err) => console.error('Greška pri učitavanju istorije:', err)
  });
  }
  // ==================== Cleanup ====================
  ngOnDestroy(): void {
    this.socketService.offNovaPoruka(this.handleNovaPoruka);
    this.socketService.offTyping(this.handleTyping);
    this.currentUserSub?.unsubscribe();
    
  }
}
