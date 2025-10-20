import { Component, OnInit, NgZone, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { ChatGptService, ChatGptMessage, ChatGptTypingStatus } from '../../../services/chat-gpt.service';
import { SocketService } from '../../../services/socket.service';
import { ChangeDetectorRef } from '@angular/core';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

@Component({
  selector: 'app-chat-gpt',
  templateUrl: './chat-gpt.component.html',
  styleUrls: ['./chat-gpt.component.css'],
  standalone: false
})
export class ChatGptComponent implements OnInit, OnDestroy, AfterViewChecked {
  poruke: ChatMessage[] = [];
  novaPoruka: string = '';
  typingStatus: string = 'stopped';
  userId: number = 0; // ID korisnika kome šalješ poruke
  private shouldScroll: boolean = false;

  @ViewChild('messagesList') private messagesList!: ElementRef;

  // Listener za ChatGPT poruke
  private chatListener = (msg: ChatGptMessage) => {
    this.poruke.unshift({
      role: 'assistant',
      content: msg.tekst,
      created_at: new Date().toISOString() 
    });
    this.scrollToBottom();
  };

  // Listener za ChatGPT tipkanje
  private typingListener = (data: ChatGptTypingStatus) => {
    this.typingStatus = data.status;
  };

  constructor(
    private chatGptService: ChatGptService,
    private socketService: SocketService,
    private ngZone: NgZone,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.socketService.connect(); // obavezno pozovi connect
    
      
        this.ucitajIstoriju();

        // Registracija ChatGPT listener-a
        this.chatGptService.onChatGptMessage(this.chatListener);

        // Registracija listener-a za tipkanje
        this.chatGptService.onChatGptTyping(this.typingListener);
      
   
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  ngOnDestroy(): void {
    // Uklanjanje listener-a
    this.chatGptService.offChatGptMessage(this.chatListener);
    this.chatGptService.offChatGptTyping(this.typingListener);
  }

  private scrollToBottom(): void {
    if (this.messagesList) {
      setTimeout(() => {
        const el = this.messagesList.nativeElement;
        el.scrollTop = el.scrollHeight;
      }, 0);
    }
  }

  private ucitajIstoriju(): void {
  this.chatGptService.getHistoryForChatGpt().subscribe({
    next: (res) => {
      console.log('Istorija poruka:', res.history);

      // Sortiramo po datumu, najstarije prvo
      const istorija: ChatMessage[] = (res.history || []).sort(
        (a: ChatMessage, b: ChatMessage) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

      // Dodajemo istoriju u niz istim principom kao nove poruke (unshift)
      istorija.forEach((msg: ChatMessage) => {
        this.poruke.unshift({
          role: msg.role,
          content: msg.content,
          created_at: msg.created_at
        });
      });

      this.scrollToBottom();
    },
    error: (err) => {
      console.error('Greška pri učitavanju istorije:', err);
    }
  });
}

  posaljiPoruku(): void {
    console.log('Socket povezan?', this.socketService.isConnected());
console.log('Šaljem poruku:', this.novaPoruka);
    if (!this.socketService.isConnected()) {
      console.error('Socket nije povezan, ne možemo poslati poruku.');
      return;
    }

    const porukaZaSlanje = this.novaPoruka.trim();
    if (!porukaZaSlanje) return;

    // Prikaz poruke korisnika
    const now = new Date().toISOString();
    this.poruke.unshift({
      role: 'user',
      content: porukaZaSlanje,
      created_at: now
    });
    this.scrollToBottom();

    // Pošalji poruku preko Socket-a
    this.chatGptService.sendMessageSocket(porukaZaSlanje);

    // Reset input-a
    this.novaPoruka = '';
  }
 porukaIsToday(createdAt: string | Date): boolean {
  const date = new Date(createdAt);
  const today = new Date();
  return date.toDateString() === today.toDateString();
} 
}
