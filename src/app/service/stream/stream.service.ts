import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Stream } from '../../model/Stream';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { WebsocketService } from '../websocket/websocket.service';

@Injectable({
  providedIn: 'root'
})
export class StreamService {

  private readonly baseUrl: string = environment.apiBaseUrl;

  constructor(private http: HttpClient, private websocketService: WebsocketService) { }

  public getStream(streamCode: string): Observable<Stream> {
    console.log("Fetching stream:", streamCode);
    return this.http.get<Stream>(`${this.baseUrl}/streams/${streamCode}`);
    
  }

  public createStream(stream: Stream): Observable<Stream> {
    console.log('Creating stream:', stream);
    return this.http.post<Stream>(`${this.baseUrl}/streams`, stream);
  }


  public deleteStream(streamCode: string): Observable<void> {
    console.log(`Deleting stream with code: ${streamCode}`);
    this.notifyEndStream(streamCode);
    return this.http.delete<void>(`${this.baseUrl}/streams/${streamCode}`);
  }


  public notifyEndStream(streamCode: string): void {
    console.log(`Ending stream with code: ${streamCode}`);
    this.websocketService.sendMessage(
      `/stream/${streamCode}/end`,
      { streamCode }
    );
  }


  public listenForStreamEnd(streamCode: string): Observable<void> {
    console.log(`Listening for stream end on stream ${streamCode}`);
    return this.websocketService.subscribeToTopic<void>(`/stream/${streamCode}/end`);
  }


  public listenForNewJoin(streamCode: string): Observable<string> {
    console.log(`Listening for viewer connections on stream ${streamCode}`);
    return this.websocketService.subscribeToTopic<string>(`/stream/${streamCode}/new-join`);
  }


  public sendNewJoinMessage(streamCode: string, uniqueId: string): void {
    console.log(`Sending join request to ${streamCode} for user ID ${uniqueId}`);
    this.websocketService.sendMessage(
      '/stream/join',
      { streamCode, uniqueID: uniqueId }
    );
  }

}
