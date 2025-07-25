import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpStatusCode } from '@angular/common/http';
import { catchError, finalize, interval, Subscription, throwError } from 'rxjs';

import { WebrtcService } from '../../service/webrtc/webrtc.service';
import { SignalService } from '../../service/signal/signal.service';
import { AuthenticationService } from '../../service/authentication/authentication.service';
import { StreamService } from '../../service/stream/stream.service';
import { User } from '../../model/User';
import { Stream } from '../../model/Stream';
import { StreamType } from '../../model/util/StreamType';
import { streamQuality } from '../../model/util/StreamQuality';
import { StreamInfo } from '../../model/StreamInfo';
import { StreamDemoComponent } from "../../components/stream-demo/stream-demo.component";
import { PastStreamComponent } from "../../components/past-stream/past-stream.component";
import { StreamControlsComponent } from "../../components/stream-controls/stream-controls.component";
import { StreamInfoComponent } from "../../components/stream-info/stream-info.component";
import { StreamShareLinkDemoComponent } from "../../components/stream-share-link-demo/stream-share-link-demo.component";
import { ShareStreamComponent } from "../../components/share-stream/share-stream.component";
import { StreamStatsComponent } from "../../components/stream-stats/stream-stats.component";
import { StreamQuickSettingsComponent } from "../../components/stream-quick-settings/stream-quick-settings.component";



interface StreamStats {
  viewers: number;
  likes: number;
  duration: number;
}

@Component({
  selector: 'app-studio',
  standalone: true,
  imports: [CommonModule, FormsModule, PastStreamComponent, StreamControlsComponent, StreamInfoComponent, ShareStreamComponent, StreamStatsComponent, StreamQuickSettingsComponent],
  templateUrl: './studio.component.html',
  styleUrl: './studio.component.css',
})
export class StudioComponent implements OnDestroy, OnInit {
  @ViewChild('localVideo', { static: false })
  localVideo!: ElementRef<HTMLVideoElement>;

  streamInfo: StreamInfo = {
    title: '',
    code: this.generateRandomId(),
    description: '',
    streamerName: '',
    quality: streamQuality.FULL_HD,
    type: StreamType.WEBCAM,
    stats: {
      viewers: 0,
      likes: 0,
      duration: 0
    },
    isChatEnabled: false
  }

  streamTitle: string = '';
  streamDescription: string = '';

  isLive: boolean = false;
  isLoading: boolean = false;
  stream?: Stream;


  readonly streamTypes = StreamType;
  readonly streamQualities = streamQuality;

  // Current user info TODO: (should be retrieved from authentication service)
  private currentUser: User = {
    id: 1,
    username: 'a',
    email: 'a',
    password: 'a',
  };

  private timerSubscription?: Subscription;
  private statsSubscription?: Subscription;
  private viewerSubscription?: Subscription;

  constructor(
    private webrtcService: WebrtcService,
    private streamService: StreamService,
    private authService: AuthenticationService,
    private router: Router
  ) { }


  ngOnInit(): void {
    this.streamService.stream$.subscribe((stream) => {
      this.stream = stream;
    })

    this.streamService.streamInfo$.subscribe((streamInfo) => {
      this.streamInfo = streamInfo;
    })

    this.streamService.isLive$.subscribe((isLive) => {
      this.isLive = isLive;

      isLive
        ? this.handleStreamCreationSuccess(this.stream!)
        : this.handleStreamCreationError();

    })
  }

  ngOnDestroy(): void {
    this.cleanupResources();
  }


  get fullStreamUrl(): string {
    return `${window.location.origin}/watch/${this.streamInfo.code}`;
  }


  startStream(): void {
    if (this.isLive || this.isLoading) {
      return;
    }

    this.isLoading = true;
    console.log('Attempting to start stream with code:', this.streamInfo.code);


  }


  endStream(): void {
    if (!this.isLive) {
      return;
    }

    this.isLive = false;
    this.cleanupResources();

    this.webrtcService.stopStream().then(() => {
      if (this.localVideo?.nativeElement) {
        this.localVideo.nativeElement.srcObject = null;
      }
    });

    this.streamService.notifyEndStream(this.streamInfo.code);
    this.streamService.deleteStream(this.streamInfo.code);

    this.resetStats();
  }


  shareStream(): void {
    window.open(this.fullStreamUrl, '_blank');
  }


  copyStreamLink(): void {
    navigator.clipboard.writeText(this.fullStreamUrl)
      .then(() => {
        alert('Stream link copied to clipboard!');
      })
      .catch((err) => {
        console.error('Failed to copy stream link:', err);
        alert('Failed to copy stream link');
      });
  }


  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }


  formatTime(seconds: number): string {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }




  private async handleStreamCreationSuccess(response: Stream): Promise<void> {
    console.log('Stream created on server:', response);
    this.stream = response;
    this.isLive = true;

    try {
      await this.webrtcService.startStream(this.streamInfo.type);

      if (this.localVideo?.nativeElement) {

        this.localVideo.nativeElement.srcObject = this.webrtcService.localStreamValue;
        this.localVideo.nativeElement.muted = true; // Mute local preview


      }

      this.listenForViewers();

      this.startTimers();

      alert('Stream started successfully!');
    } catch (error) {
      console.error('Failed to start stream:', error);
      alert('Failed to access camera/microphone. Please check permissions.');
      this.endStream();
    }
  }


  private handleStreamCreationError(): void {

  }

  private listenForViewers(): void {
    this.viewerSubscription = this.streamService
      .listenForNewJoin(this.streamInfo.code)
      .subscribe({
        next: (message) => {
          console.log('Received viewer connection request:', message);
          // Create a WebRTC connection for this viewer
          this.webrtcService.createStreamerRTCConnection(message, this.streamInfo.code);
        },
        error: (err) => console.error('Error listening for viewers:', err)
      });
  }


  private startTimers(): void {
    this.timerSubscription = interval(1000).subscribe(() => {
      this.streamInfo.stats.duration++;
    });

    // TODO: Replace with actual viewer analytics
    this.statsSubscription = interval(3000).subscribe(() => {
      if (this.isLive) {
        this.streamInfo.stats.viewers = Math.floor(Math.random() * 20) + this.streamInfo.stats.viewers;
        this.streamInfo.stats.likes = Math.floor(Math.random() * 5) + this.streamInfo.stats.likes;
      }
    });
  }


  private cleanupResources(): void {
    [this.timerSubscription, this.statsSubscription, this.viewerSubscription].forEach(
      subscription => {
        if (subscription) {
          subscription.unsubscribe();
        }
      }
    );
  }


  private resetStats(): void {
    this.streamInfo.stats = {
      viewers: 0,
      likes: 0,
      duration: 0
    };
  }


  private generateRandomId(): string {
    return Math.random().toString(36).substring(2, 10);
  }


}