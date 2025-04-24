import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { catchError, interval, Subscription, throwError } from 'rxjs';
import { WebrtcService } from '../../service/webrtc/webrtc.service';
import { SignalService } from '../../service/signal/signal.service';
import { User } from '../../model/User';
import { Stream } from '../../model/Stream';
import { HttpStatusCode } from '@angular/common/http';

@Component({
  selector: 'app-studio',
  imports: [CommonModule, FormsModule],
  templateUrl: './studio.component.html',
  styleUrl: './studio.component.css',
})
export class StudioComponent {
  @ViewChild('localVideo', { static: false })
  localVideo!: ElementRef<HTMLVideoElement>;

  isLive: boolean = false;
  streamCode: string = this.generateRandomId();
  streamTime: number = 0;
  streamType: string = 'Webcam';
  viewers: number = 0;
  likes: number = 0;
  streamQuality: string = 'HD 720p';
  title: string = '';
  description: string = '';

  stream?: Stream;

  mockUser: User = {
    id: 1,
    username: 'a',
    email: 'a',
    password: 'a',
  };

  private timerSubscription?: Subscription;
  private statsSubscription?: Subscription;

  constructor(
    private webrtcService: WebrtcService,
    private signalService: SignalService
  ) {}

  ngOnInit(): void {
    // Initialize component
  }

  ngOnDestroy(): void {
    this.stopTimers();
  }

  get fullStreamUrl(): string {
    return `${window.location.origin}/watch/${this.streamCode}`;
  }

  startStream(): void {
    if (!this.isLive) {
      this.isLive = true;
      console.log('Attempting to start stream with code:', this.streamCode);


      this.signalService
        .createStream({
          owner: this.mockUser,
          code: this.streamCode,
          title: this.title,
          description: this.description,
        })
        .pipe(
          catchError((error) => {
            if (error?.status === HttpStatusCode.BadRequest) {
              alert('This stream code is already taken! Please try again.');
            } else {
              alert('Failed to create stream. Please try again.');
            }
            return throwError(() => error);
          })
        )
        .subscribe((response) => {
          console.log('Stream created on server:', response);

          // Start local media stream
          this.webrtcService
            .startStream(this.streamCode, this.streamType)
            .then(() => {
              // Set local video display
              console.log('Setting local video source');
              this.localVideo.nativeElement.srcObject =
                this.webrtcService.localStreamValue;
              this.localVideo.nativeElement.muted = true; // Mute local preview

              // Start listening for viewer connections
              this.signalService
                .connectToStream(this.streamCode)
                .subscribe((message) => {
                  console.log('Received viewer connection request:', message);

                  // Create a WebRTC connection for this viewer
                  this.webrtcService.createStreamerRTCConnection(
                    message,
                    this.streamCode
                  );
                });

              this.startTimers();
              alert('Stream started successfully!');
            })
            .catch((error) => {
              console.error('Failed to start stream:', error);
              alert(
                'Failed to access camera/microphone. Please check permissions.'
              );
            });
        });
    }
  }

  endStream(): void {
    if (this.isLive) {
      this.isLive = false;

      this.webrtcService.stopStream(this.streamCode).then(() => {
        this.localVideo.nativeElement.srcObject = null;
      });

      this.stopTimers();
      this.resetStats();
    }
  }

  copyStreamLink(): void {
    navigator.clipboard.writeText(this.fullStreamUrl).then(() => {
      alert('Stream link copied to clipboard!');
    });
  }

  private startTimers(): void {
    // Timer for stream duration
    this.timerSubscription = interval(1000).subscribe(() => {
      this.streamTime++;
    });

    // Simulate changing viewer stats
    this.statsSubscription = interval(3000).subscribe(() => {
      if (this.isLive) {
        this.viewers = Math.floor(Math.random() * 20) + this.viewers;
        this.likes = Math.floor(Math.random() * 5) + this.likes;
      }
    });
  }

  private stopTimers(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
    if (this.statsSubscription) {
      this.statsSubscription.unsubscribe();
    }
  }

  private resetStats(): void {
    this.streamTime = 0;
    this.viewers = 0;
    this.likes = 0;
  }

  private generateRandomId(): string {
    return Math.random().toString(36).substring(2, 10);
  }

  formatTime(seconds: number): string {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hrs.toString().padStart(2, '0')}:${mins
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
}
