import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SocketService } from './socket.service';

export interface ChatMessage {
  id?: number;
  from_user: number;
  to_user: number;
  content: string;
  created_at: string;
  role?: 'user' | 'assistant';
}

interface NovaPorukaData {
  roomId: string;
  tekst: string;
  userId: number;
  vreme: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private wrapperMap = new Map<(msg: ChatMessage) => void, (data: any) => void>();
  private apiUrl = 'http://5.75.164.111:5001/api/chat';

  constructor(private socketService: SocketService, private http: HttpClient) {}

  // ==================== POVLAČENJE ISTORIJE ====================
  getHistory(otherUserId: number): Observable<ChatMessage[]> {
    return this.http.get<{ history: ChatMessage[] }>(
      `${this.apiUrl}/history/${otherUserId}`
    ).pipe(
      map(res => res.history)
    );
  }

  // ==================== SLANJE PORUKE PREKO SOCKETA ====================
  sendMessageSocket(toUserId: number, tekst: string) {
    const token = localStorage.getItem('token') || '';
    this.socketService.emit('send_message', { to_user_id: toUserId, message: tekst, token });
  }

  // ==================== SOCKET LISTENERS ====================
  onNewMessage(callback: (msg: ChatMessage) => void) {
  if (this.wrapperMap.has(callback)) return;

  // Wrapper tipa koji SocketService očekuje
  const wrapper: (msg: { from_user: number; to_user: number; content: string; created_at: string }) => void = 
    (data) => {
      const novaPoruka: ChatMessage = {
        from_user: data.from_user,
        to_user: data.to_user,
        content: data.content,
        created_at: data.created_at
      };
      callback(novaPoruka);
    };

  this.wrapperMap.set(callback, wrapper);
  this.socketService.onNovaPoruka(wrapper);
}

  offNewMessage(callback: (msg: ChatMessage) => void) {
    const wrapper = this.wrapperMap.get(callback);
    if (wrapper) {
      this.socketService.offNovaPoruka(wrapper);
      this.wrapperMap.delete(callback);
    }
  }

  // ==================== TIPKANJE ====================
  sendTypingStatus(toUserId: number, status: 'typing' | 'stopped') {
    const token = localStorage.getItem('token') || '';
    this.socketService.emit('typing', { to_user_id: toUserId, status, token });
  }

  onTyping(callback: (data: { userId: number; status: string }) => void) {
    this.socketService.onTyping(callback);
  }

  offTyping(callback: (data: { userId: number; status: string }) => void) {
    this.socketService.offTyping(callback);
  }

  // ==================== HELPERS ====================
  private getOtherUserId(roomId: string, userId: number): number {
    // roomId je u formatu "chat_minId_maxId"
    const parts = roomId.split('_');
    const id1 = parseInt(parts[1], 10);
    const id2 = parseInt(parts[2], 10);
    return id1 === userId ? id2 : id1;
  }
}
