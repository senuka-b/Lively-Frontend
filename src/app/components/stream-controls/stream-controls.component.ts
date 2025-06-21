import { Component, OnInit } from '@angular/core';
import { StreamInfo } from '../../model/StreamInfo';
import { streamQuality } from '../../model/util/StreamQuality';
import { StreamType } from '../../model/util/StreamType';
import { CommonModule } from '@angular/common';
import { StreamService } from '../../service/stream/stream.service';
import { catchError, Observable, throwError } from 'rxjs';
import { Stream } from '../../model/Stream';
import { AuthenticationService } from '../../service/authentication/authentication.service';
import { HttpStatusCode } from '@angular/common/http';

@Component({
  selector: 'app-stream-controls',
  imports: [CommonModule],
  templateUrl: './stream-controls.component.html',
  styleUrl: './stream-controls.component.css'
})
export class StreamControlsComponent implements OnInit {
  //
  streamInfo?: StreamInfo;
  isLive?: boolean;

  constructor(private streamService: StreamService, private authService: AuthenticationService) { }

  ngOnInit(): void {
    this.streamService.isLive$.subscribe((result: boolean) => {
      this.isLive = result;
    });

    this.streamService.streamInfo$.subscribe((result: StreamInfo) => {
      this.streamInfo = result;
    })

  }

  goLive() {
    console.log("Stream Controls > StreamInfo", this.streamInfo);
    
    this.createStreamOnServer()
    .subscribe({
      next: (response) => {
        this.streamService.isLive$ = true;
        this.streamService.stream$ = response;

      },
      error: (error) => {
        console.log("ERROR: Unable to create stream on server", error);
        

        this.streamService.isLive$ = false
      }
    });
  }

  private createStreamOnServer() : Observable<Stream> {
    return this.streamService.createStream({
      owner: this.authService.user,
      code: this.streamInfo!.code,
      title: this.streamInfo!.title,
      description: this.streamInfo!.description,
    }).pipe(
      catchError((error) => {
        if (error?.status === HttpStatusCode.BadRequest) {
          alert('This stream code is already taken! Please try again.');
        } else {
          alert('Failed to create stream. Please try again.');
        }
        return throwError(() => error);
      })
    );
  }

  

  

}