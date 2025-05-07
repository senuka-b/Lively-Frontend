import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Stream } from '../../model/Stream';

@Injectable({
  providedIn: 'root'
})
export class StreamInfoService {

  constructor(private http: HttpClient) { }

  getStreamInfo(streamId: string): Observable<Stream> {
    return this.http.get<Stream>(`http://localhost:8080/api/streams/${streamId}`);
  }


}
