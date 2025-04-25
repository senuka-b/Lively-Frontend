import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../../model/User';
import { Stream } from '../../model/Stream';
import { Observable } from 'rxjs';
import { Client, Stomp } from '@stomp/stompjs';
import { IceCandidate } from '../../model/IceCandidate';
import { SdpDescription } from '../../model/SdpDescription';

@Injectable({
  providedIn: 'root',
})
export class SignalService {
  private baseUrl: string = 'http://localhost:8080';
  private headers: HttpHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
  });

  private stompClient: Client | undefined;
  private connected: boolean = false;

  constructor(private http: HttpClient) {
    this.connectWebsocket();
  }

  private connectWebsocket() {
    const socket = new WebSocket(`ws://localhost:8080/ws`);
    this.stompClient = Stomp.over(socket);


    this.stompClient.onConnect = (frame) => {
      console.log('Connected to WebSocket:', frame);
      this.connected = true;
    };

    this.stompClient.onStompError = (frame) => {
      console.error('STOMP error:', frame);
      this.connected = false;
      // Reconnect after a delay
      setTimeout(() => this.connectWebsocket(), 5000);
    };

    this.stompClient.onWebSocketClose = () => {
      console.warn('WebSocket connection closed');
      this.connected = false;

      setTimeout(() => this.connectWebsocket(), 5000);
    };

    this.stompClient.activate();
    
  }

  private ensureConnectedAndSend(destination: string, body: string): void {
    if (this.connected && this.stompClient) {
      this.stompClient.publish({
        destination,
        body,
      });
    } else {
      console.warn('Not connected to WebSocket, trying to reconnect...');
      const checkInterval = setInterval(() => {
        if (this.connected && this.stompClient) {
          this.stompClient.publish({
            destination,
            body,
          });
          clearInterval(checkInterval);
        }
      }, 500);

      setTimeout(() => clearInterval(checkInterval), 10000);
    }
  }


  connectToStream(streamCode: string): Observable<string> {
    console.log(`Listening for viewer connections on stream ${streamCode}`);
    return new Observable((observer) => {
      this.stompClient?.subscribe(
        `/topic/stream/${streamCode}/new-join`,
        (message) => {
          console.log('New viewer joined:', message.body);
          observer.next(message.body);
        }
      );
    });
  }

  listenForICECandidate(
    streamCode: string,
    viewer: string
  ): Observable<IceCandidate> {
    console.log(
      `Listening for ICE candidates on stream ${streamCode} for ${viewer}`
    );
    return new Observable((observer) => {
      this.stompClient?.subscribe(
        `/topic/stream/${streamCode}/ice-candidate/${viewer}`,
        (message) => {
          try {
            const iceCandidate: IceCandidate = JSON.parse(message.body);
            console.log(`Received ICE candidate (${iceCandidate.type})`);
            observer.next(iceCandidate);
          } catch (error) {
            console.error('Error parsing ICE candidate:', error);
          }
        }
      );
    });
  }

  sendICECandidate(
    streamCode: string,
    viewer: string,
    candidate: IceCandidate
  ): void {
    console.log(
      `Sending ICE candidate (${candidate.type}) for stream ${streamCode} to ${viewer}`
    );
    this.ensureConnectedAndSend(
      `/socket/stream/${streamCode}/ice-candidate/${viewer}`,
      JSON.stringify(candidate)
    );
  }

  sendNewJoinMessage(streamCode: string, uniqueId: string): void {
    console.log(
      `Sending join request tp ${streamCode} for user ID ${uniqueId}`
    );
    this.ensureConnectedAndSend(
      '/socket/stream/join',
      JSON.stringify({ streamCode: streamCode, uniqueID: uniqueId })
    );
  }

  createStream(stream: Stream): Observable<HttpResponse<Stream>> {
    console.log('Creating stream:', stream);
    return this.http.post<Stream>(this.baseUrl + '/api/streams', stream, {
      headers: this.headers,
      observe: 'response',
    });
  }

  deleteStream(streamCode: string): Observable<void> {
    console.log(`Deleting stream with code: ${streamCode}`);
    
    this.endStream(streamCode);

    return this.http.delete<void>(`${this.baseUrl}/api/streams/${streamCode}`, {
      headers: this.headers,
    });

  }

  endStream(streamCode: string): void {
    console.log(`Ending stream with code: ${streamCode}`);
  
    
    this.ensureConnectedAndSend(
      `/socket/stream/${streamCode}/end`,
      JSON.stringify({ streamCode })
    );
  }

  listenForStreamEnd(streamCode: string): Observable<void> {
    console.log(`Listening for stream end on stream ${streamCode}`);

    return new Observable((observer) => {
      this.stompClient?.subscribe(
        `/topic/stream/${streamCode}/end`,
        (message) => {
          console.log('Stream ended:', message.body);
          observer.next();
        }
      );
    });
  }

  sendSDP(streamCode: string, viewer: string, sdp: SdpDescription) {
    console.log(
      `Sending SDP (${sdp.type}) for stream ${streamCode} to ${viewer}`
    );
    this.ensureConnectedAndSend(
      `/socket/stream/${streamCode}/sdp/${viewer}`,
      JSON.stringify(sdp)
    );
  }

  listenForSDP(streamCode: string, viewer: string): Observable<SdpDescription> {
    console.log(`Listening for SDP on stream ${streamCode} for ${viewer}`);
    return new Observable((observer) => {
      this.stompClient?.subscribe(
        `/topic/stream/${streamCode}/sdp/${viewer}`,
        (message) => {
          try {
            const sdpDescription: SdpDescription = JSON.parse(message.body);
            console.log(`Received SDP (${sdpDescription.type})}`);
            observer.next(sdpDescription);
          } catch (error) {
            console.error('Error parsing SDP:', error);
          }
        }
      );
    });
  }

  sendChatMessage(sender:string, senderGuestName:string,  streamCode: string, message: string): void {
    this.stompClient?.publish({
      destination: `/socket/stream/${streamCode}/chat`,
      body: JSON.stringify({
        sender,
        senderGuestName,
        message
      }),
    });
  }

  listenForChatMessages(streamCode: string): Observable<any> {
    return new Observable((observer) => {
      this.stompClient?.subscribe(
        `/topic/stream/${streamCode}/chat`,
        (message) => {
          try {
            const chatMessage = JSON.parse(message.body);
            console.log('Received chat message:', chatMessage);
            observer.next(chatMessage);
          } catch (error) {
            console.error('Error parsing chat message:', error);
          }
        }
      );
    });
  } 

}
