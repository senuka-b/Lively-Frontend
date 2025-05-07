import { Injectable } from '@angular/core';
import { WebsocketService } from '../websocket/websocket.service';
import { Observable } from 'rxjs';
import { ChatMessage } from '../../model/ChatMessage';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor(private websocketService: WebsocketService) { }

  public sendChatMessage(sender: string, senderGuestName: string, streamCode: string, message: string): void {
    this.websocketService.sendMessage(
      `/stream/${streamCode}/chat`,
      { sender, senderGuestName, message }
    );
  }

  public listenForChatMessages(streamCode: string): Observable<ChatMessage> {
    return this.websocketService.subscribeToTopic<ChatMessage>(
      `/topic/stream/${streamCode}/chat`,
      (message) => JSON.parse(message)
    );
  }
}
