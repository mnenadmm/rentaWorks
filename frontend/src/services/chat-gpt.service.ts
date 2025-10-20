import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SocketService, ChatMessage } from './socket.service';
import { BehaviorSubject } from 'rxjs';
// Interfaces koje koristiš
export interface ChatGptMessage {
  userId: number;       // 0 = ChatGPT
  tekst: string;        // poruka bota
  status?: 'complete' | string;
}

export interface ChatGptTypingStatus {
  userId: number;       // 0 = ChatGPT
  status: 'typing' | 'stopped';
}

@Injectable({
  providedIn: 'root'
})
export class ChatGptService {
  private apiUrlSend = 'http://5.75.164.111:5001/api/chatgpt/send';
  private chatGptWrappers = new Map<(msg: ChatGptMessage) => void, (msg: ChatGptMessage) => void>();
  private typingGptWrappers = new Map<(data: ChatGptTypingStatus) => void, (data: ChatGptTypingStatus) => void>();

  
  constructor(private http: HttpClient, private socketService: SocketService) {}

  // ==================== POVLAČENJE ISTORIJE sa chatgbt ====================
  getHistoryForChatGpt(): Observable<any> {
  const token = localStorage.getItem('token') || '';

  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  });

  // Ovde koristiš backend koji vraća istoriju
  const url = 'http://5.75.164.111:5001/api/chatgpt/history';

  return this.http.get(url, { headers });
}
  // ==================== SLANJE PORUKE ====================
sendMessageSocket(tekst: string) {
  const token = localStorage.getItem("token") || '';
  console.log('Nalazimo se u chatGBT servisu',tekst)
  this.socketService.emit("send_message", { token, message: tekst });
}
   // ==================== ChatGPT poruke ====================
  onChatGptMessage(callback: (msg: ChatGptMessage) => void) {
  this.socketService.onChatGptMessage(callback);
}

offChatGptMessage(callback: (msg: ChatGptMessage) => void) {
  this.socketService.offChatGptMessage(callback);
}
// ==================== ChatGPT tipkanje ====================
onChatGptTyping(callback: (data: ChatGptTypingStatus) => void) {
  this.socketService.onChatGptTyping(callback);
}

offChatGptTyping(callback: (data: ChatGptTypingStatus) => void) {
  this.socketService.offChatGptTyping(callback);
}

 

 
}
