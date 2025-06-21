import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Client, Stomp } from '@stomp/stompjs';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  private readonly wsURL: string = environment.wsEndpoint;
  private readonly destinationPrefix: string = "/socket"
  private readonly topicPrefix: string = "/topic"

  private stompClient?: Client;
  private connectionState$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false); // For rendering socket connection status in UI
  private reconnectInterval: number = 5000; // 5 seconds
  private maxRetryInterval: number = 10000; // 10 seconds

  get isConnected(): boolean {
    return this.connectionState$.value;
  }


  get connectionState(): Observable<boolean> {
    return this.connectionState$.asObservable();
  }


  constructor(private http: HttpClient) { 
    this.initializeWebSocketConnection();
  }


  public sendMessage(destination: string, payload: any): void {
    const body = typeof payload === 'string' ? payload : JSON.stringify(payload);
    
    if (this.isConnected && this.stompClient) {
      this.stompClient.publish({
        destination : this.destinationPrefix + destination,
        body,
      });
    } else {
      console.warn('Not connected to WebSocket, queuing message for retry...');
      this.retryMessageSend(destination, body);
    }
  }



  public subscribeToTopic<T>(
    topic: string, 
    parser?: (message: string) => T
  ): Observable<T> {
    return new Observable<T>((observer) => {
      if (!this.stompClient) {
        observer.error(new Error('STOMP client not initialized'));
        return;
      }
      
      const subscription = this.stompClient.subscribe(this.topicPrefix + topic, (message) => {
        try {
          const data = parser ? parser(message.body) : message.body as unknown as T;
          observer.next(data);
        } catch (error) {
          console.error(`Error parsing message from ${topic}:`, error);
          observer.error(error);
        }
      });
      
      // Return unsubscribe function
      return () => {
        if (subscription) {
          subscription.unsubscribe();
        }
      };
    });
  }


  private initializeWebSocketConnection(): void {
    const socket = new WebSocket(this.wsURL);
    this.stompClient = Stomp.over(socket);

    this.stompClient.onConnect = (frame) => {
      console.log('Connected to WebSocket:', frame);
      this.connectionState$.next(true);
    };

    this.stompClient.onStompError = (frame) => {
      console.error('STOMP error:', frame);
      this.connectionState$.next(false);
      this.scheduleReconnect();
    };

    this.stompClient.onWebSocketClose = () => {
      console.warn('WebSocket connection closed');
      this.connectionState$.next(false);
      this.scheduleReconnect();
    };

    this.stompClient.activate();
  }
  

  private scheduleReconnect(): void {
    setTimeout(() => this.initializeWebSocketConnection(), this.reconnectInterval);
  }

  private retryMessageSend(destination: string, body: string): void {
    let attempts = 0;
    const maxAttempts = Math.ceil(this.maxRetryInterval / 500);
    
    const checkInterval = setInterval(() => {
      attempts++;
      
      if (this.isConnected && this.stompClient) {
        this.stompClient.publish({
          destination,
          body,
        });
        clearInterval(checkInterval);
      } else if (attempts >= maxAttempts) {
        console.error(`Failed to send message after ${attempts} attempts`);
        clearInterval(checkInterval);
      }
    }, 500);
  }



}
