import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { Client, Stomp } from '@stomp/stompjs';

import { User } from '../../model/User';
import { Stream } from '../../model/Stream';
import { IceCandidate } from '../../model/IceCandidate';
import { SdpDescription } from '../../model/SdpDescription';
import { ChatMessage } from '../../model/ChatMessage';
import { WebsocketService } from '../websocket/websocket.service';

/**
 * Service for handling WebRTC signaling 
 */
@Injectable({
  providedIn: 'root',
})
export class SignalService {


  constructor(private websocketService: WebsocketService) {}


  public listenForICECandidate(streamCode: string, viewer: string): Observable<IceCandidate> {
    console.log(`Listening for ICE candidates on stream ${streamCode} for ${viewer}`);
    return this.websocketService.subscribeToTopic<IceCandidate>(
      `/stream/${streamCode}/ice-candidate/${viewer}`, 
      (message) => JSON.parse(message)
    );
  }

  public sendICECandidate(streamCode: string, viewer: string, candidate: IceCandidate): void {
    console.log(`Sending ICE candidate (${candidate.type}) for stream ${streamCode} to ${viewer}`);
    this.websocketService.sendMessage(
      `/stream/${streamCode}/ice-candidate/${viewer}`,
      candidate
    );
  }


  public listenForSDP(streamCode: string, viewer: string): Observable<SdpDescription> {
    console.log(`Listening for SDP on stream ${streamCode} for ${viewer}`);
    return this.websocketService.subscribeToTopic<SdpDescription>(
      `/stream/${streamCode}/sdp/${viewer}`,
      (message) => JSON.parse(message)
    );
  }


  public sendSDP(streamCode: string, viewer: string, sdp: SdpDescription): void {
    console.log(`Sending SDP (${sdp.type}) for stream ${streamCode} to ${viewer}`);
    this.websocketService.sendMessage(
      `/stream/${streamCode}/sdp/${viewer}`,
      sdp
    );
  }
  
}