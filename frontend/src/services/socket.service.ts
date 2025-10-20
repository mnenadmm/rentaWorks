// socket.service.ts
import { Injectable } from "@angular/core";
import { io, Socket } from "socket.io-client";
import { BehaviorSubject } from "rxjs";
import { HttpClient } from "@angular/common/http";

export interface ChatMessage {
  id?: number;
  from_user: number;
  to_user: number;
  content: string;
  created_at: string;
  role?: "user" | "assistant";
}
export interface ChatGptMessage {
  userId: number; // 0 za asistenta, >0 za korisnika
  tekst: string;
  created_at?: string; // ako želiš da dodaš vreme (može iz backend-a)
}
export interface ChatGptTypingStatus {
  userId: number; // uvek 0 za bota
  status: "typing" | "stopped";
}
@Injectable({
  providedIn: "root"
})
export class SocketService {
  private socket: Socket | null = null;
  private connected = false;
  public connected$ = new BehaviorSubject<boolean>(false);
  private apiUrl = "http://5.75.164.111:5001";

  // Callback mape
  private userChatWrappers = new Map<(msg: ChatMessage) => void, (msg: ChatMessage) => void>();
  private typingWrappers = new Map<(data: { userId: number; status: string }) => void, (data: { userId: number; status: string }) => void>();
  private chatGptWrappers = new Map<(msg: ChatGptMessage) => void,(msg: ChatGptMessage) => void>();
  private typingGptWrappers = new Map<(data: ChatGptTypingStatus) => void,(data: ChatGptTypingStatus) => void>();
  private noviOglasWrappers = new Map<(data: any) => void, (data: any) => void>();
  private oglasObrisanWrappers = new Map<(data: any) => void, (data: any) => void>();
  private oglasAzuriranWrappers = new Map<(data: any) => void, (data: any) => void>();

  constructor(private http: HttpClient) {}

  connect(): void {
    if (this.socket?.connected) return; // Sprečava višestruke konekcije

    const token = localStorage.getItem("token") || "";
    this.socket = io(this.apiUrl, { auth: { token }, transports: ["websocket"] });

    this.socket.on("connect", () => {
      console.log("Socket povezan", this.socket?.id);
      this.setConnected(true); // <--- OBAVEZNO

      //Slusa poruke
      this.userChatWrappers.forEach(wrapper => this.socket?.on("new_message", wrapper));
      //Slusa status kucanja za usere
      this.typingWrappers.forEach(wrapper => this.socket?.on("typing", wrapper));
      //Slusa poruke od chatGBT
      this.chatGptWrappers.forEach(wrapper => this.socket?.on("chat_gpt_response", wrapper));
      //Slusa poruke o statusu kucanja chatGBT
      this.typingGptWrappers.forEach(wrapper => this.socket?.on("typing_chatgbt", wrapper));
      //Postavljanje novog oglasa
      this.noviOglasWrappers.forEach(wrapper => this.socket?.on("novi_oglas", wrapper));
      this.oglasObrisanWrappers.forEach(wrapper => this.socket?.on("oglas_obrisan", wrapper));
      this.oglasAzuriranWrappers.forEach(wrapper => this.socket?.on("oglas_azuriran", wrapper));
    });

    this.socket.on("disconnect", () => {
      console.log("Socket diskonektovan");
      this.connected$.next(false);
    });
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
    this.setConnected(false);
  }
emit(event: string, data?: any) {
  if (this.socket) {
    console.log("Emitujem event:", event, "sa podacima:", data); // <-- dodaj ovo
    this.socket.emit(event, data);
  } else {
    console.warn("Socket nije povezan. Ne mogu emitovati događaj:", event);
  }
}
  isConnected(): boolean {
  return this.connected && this.socket?.connected === true;
}
  private setConnected(status: boolean) {
    this.connected = status;
    this.connected$.next(status);
  }

  // ==================== CHAT ====================
 posaljiPoruku(poruka: { to_user: number; content: string; from_user: number }) {
  if (!this.socket || !this.socket.connected) {
    console.warn("Socket nije povezan! Ne mogu poslati poruku:", poruka);
    return;
  }
  const token = localStorage.getItem("token");
  if (!token) {
    console.error("Token nije pronađen! Ne mogu poslati poruku:", poruka);
    return;
  }
   console.log("Emitujem event: send_message sa podacima:", {
    token,
    message: poruka.content,
    to_user_id: poruka.to_user
  });
  this.socket.emit("send_message", { 
     token, 
    message: poruka.content, 
    to_user_id: poruka.to_user 
  });
}

  onNovaPoruka(callback: (msg: ChatMessage) => void) {
    if (!this.userChatWrappers.has(callback)) {
      this.userChatWrappers.set(callback, callback);
      this.socket?.on("new_message", callback);
    }
  }

  offNovaPoruka(callback: (msg: ChatMessage) => void) {
    const wrapper = this.userChatWrappers.get(callback);
    if (wrapper) {
      this.socket?.off("new_message", wrapper);
      this.userChatWrappers.delete(callback);
    }
  }

  onTyping(callback: (data: { userId: number; status: string }) => void) {
    if (!this.typingWrappers.has(callback)) {
      this.typingWrappers.set(callback, callback);
      this.socket?.on("typing", callback);
    }
  }
  offTyping(callback: (data: { userId: number; status: string }) => void) {
  const wrapper = this.typingWrappers.get(callback);
  if (wrapper) {
    this.socket?.off("typing", wrapper);
    this.typingWrappers.delete(callback);
  }
}
  emitTypingStatus(to_user_id: number, status: "typing" | "stopped") {
  this.socket?.emit("typing", {
    token: localStorage.getItem("token"),
    to_user_id,
    status
  });
}
  // ==================== ChatGPT ====================
onChatGptMessage(callback: (msg: ChatGptMessage) => void) {
  if (!this.chatGptWrappers.has(callback)) {
    this.chatGptWrappers.set(callback, callback);
    // Ako je socket već povezan, registruj odmah
    if (this.socket?.connected) {
      this.socket.on("chat_gpt_response", callback);
    }
  }
}

offChatGptMessage(callback: (msg: ChatGptMessage) => void) {
  const wrapper = this.chatGptWrappers.get(callback);
  if (wrapper) {
    this.socket?.off("chat_gpt_response", wrapper);
    this.chatGptWrappers.delete(callback);
  }
}

onChatGptTyping(callback: (data: ChatGptTypingStatus) => void) {
  if (!this.typingGptWrappers.has(callback)) {
    this.typingGptWrappers.set(callback, callback);
    if (this.socket?.connected) {
      this.socket.on("typing_chatgbt", callback);
    }
  }
}
  

offChatGptTyping(callback: (data: ChatGptTypingStatus) => void) {
  const wrapper = this.typingGptWrappers.get(callback);
  if (wrapper) {
    this.socket?.off("typing_chatgbt", wrapper);
    this.typingGptWrappers.delete(callback);
  }
}
onNoviOglas(callback: (data: any) => void) {
  if (!this.noviOglasWrappers.has(callback)) {
    this.noviOglasWrappers.set(callback, callback);
    this.socket?.on("novi_oglas", callback);
  }
}
  offNoviOglas(callback: (data: any) => void) {
    const wrapper = this.noviOglasWrappers.get(callback);
    if (wrapper) {
      this.socket?.off("novi_oglas", wrapper);
      this.noviOglasWrappers.delete(callback);
    }
  }

  onOglasObrisan(callback: (data: any) => void) {
  if (!this.oglasObrisanWrappers.has(callback)) {
    this.oglasObrisanWrappers.set(callback, callback);
    // Ako je socket već povezan, registruj odmah
    
      this.socket?.on("oglas_obrisan", callback);
   
  }
}
  offOglasObrisan(callback: (data: any) => void) {
    const wrapper = this.oglasObrisanWrappers.get(callback);
    if (wrapper) {
      this.socket?.off("oglas_obrisan", wrapper);
      this.oglasObrisanWrappers.delete(callback);
    }
  }

  onOglasAzuriran(callback: (data: any) => void) {
    if (!this.oglasAzuriranWrappers.has(callback)) {
      this.oglasAzuriranWrappers.set(callback, callback);
      this.socket?.on("oglas_azuriran", callback);
    }
  }

  offOglasAzuriran(callback: (data: any) => void) {
    const wrapper = this.oglasAzuriranWrappers.get(callback);
    if (wrapper) {
      this.socket?.off("oglas_azuriran", wrapper);
      this.oglasAzuriranWrappers.delete(callback);
    }
  }
}
