import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Stream } from '../../model/Stream';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { WebsocketService } from '../websocket/websocket.service';
import { StreamInfo } from '../../model/StreamInfo';
import { streamQuality } from '../../model/util/StreamQuality';
import { StreamType } from '../../model/util/StreamType';

@Injectable({
  providedIn: 'root'
})
export class StreamService {

  private readonly baseUrl: string = environment.apiBaseUrl;

  private isLiveSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private streamInfoSubject: BehaviorSubject<StreamInfo> = new BehaviorSubject<StreamInfo>({
    title: '',
    code: Math.random().toString(36).substring(2, 10),
    description: '',
    streamerName: '',
    quality: streamQuality.FULL_HD,
    type: StreamType.WEBCAM,
    stats: {
      viewers: 0,
      likes: 0,
      duration: 0
    }
  });
  private streamSubject: BehaviorSubject<Stream | undefined> = new BehaviorSubject<Stream | undefined>(undefined);


  constructor(private http: HttpClient, private websocketService: WebsocketService) { }

  get isLive$(): Observable<boolean> {
    return this.isLiveSubject.asObservable();
  }

  set isLive$(value: boolean) {
    this.isLiveSubject.next(value);
  }

  get streamInfo$() : Observable<StreamInfo> {
    return this.streamInfoSubject.asObservable();
  }

  set streamInfo$(value: StreamInfo) {
    this.streamInfoSubject.next(value);
  }

  get stream$() : Observable<Stream | undefined> {
    return this.streamSubject.asObservable();
  }

  set stream$(value: Stream) {
    this.streamSubject.next(value);
  }

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
