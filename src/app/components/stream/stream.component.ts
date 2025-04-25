import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SignalService } from '../../service/signal/signal.service';
import { WebrtcService } from '../../service/webrtc/webrtc.service';
import { StreamInfoService } from '../../service/streamInfo/stream-info.service';

@Component({
  selector: 'app-stream',
  imports: [CommonModule, FormsModule],
  templateUrl: './stream.component.html',
  styleUrl: './stream.component.css',
})
export class StreamComponent {
  @ViewChild('videoPlayer', { static: false })
  videoPlayer!: ElementRef<HTMLVideoElement>;

  @ViewChild('chatContainer', { static: false })
  chatContainer!: ElementRef<HTMLDivElement>;

  streamId: string = '';
  uniqueId: string = crypto.randomUUID();
  guestName: string = '';
  hasJoined: boolean = false;
  isStreamActive: boolean = true;
  viewers: number = 0;
  likes: number = 0;
  streamerName: string = '';
  streamTitle: string = '';
  currentMessage: string = '';
  chatMessages: any = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private signalService: SignalService,
    private webRtcService: WebrtcService,
    private streamService: StreamInfoService
  ) {}

  ngOnInit(): void {
    // Existing code...
    const code = this.route.snapshot.paramMap.get('code');
    if (code) {
      this.streamId = code;
      this.loadStreamInfo();
    } else {
      console.error('No stream code provided in the URL.');
      this.router.navigate(['/']);
    }
  }

  joinAsGuest(): void {
    if (this.guestName.trim()) {
      this.hasJoined = true;

      console.log(`Joining stream ${this.streamId} as ${this.guestName}`);
      this.signalService.sendNewJoinMessage(this.streamId, this.uniqueId);

      console.log('Received unique ID:', this.uniqueId);

      // Create WebRTC connection as viewer
      const connection = this.webRtcService.createViewerRTCConnection(
        this.streamId,
        this.uniqueId
      );

      const checkForStream = setInterval(() => {
        const remoteStream = this.webRtcService.getRemoteStream(this.uniqueId);
        console.log('Remote stream:', remoteStream);

        if (remoteStream && remoteStream.active) {
          console.log('Setting video source to remote stream');
          this.videoPlayer.nativeElement.srcObject = remoteStream;
          this.videoPlayer.nativeElement
            .play()
            .then(() => console.log('Video playback started'))
            .catch((err) => console.error('Error playing video:', err));
          clearInterval(checkForStream);
        }
      }, 500);

      // Add system message
      this.chatMessages.push({
        username: 'System',
        message: `${this.guestName} has joined the stream`,
        timestamp: new Date(),
        isCurrentUser: false,
      });

      this.signalService
        .listenForChatMessages(this.streamId)
        .subscribe((chatMessage) => {
          if (chatMessage.sender === this.uniqueId) return;

          this.chatMessages.push({
            username: chatMessage.senderGuestName,
            message: chatMessage.message,
            timestamp: new Date(),
            isCurrentUser: false,
          });
          this.scrollChatToBottom();
        });

      this.scrollChatToBottom();
    }
  }

  loadStreamInfo(): void {
    this.streamService.getStreamInfo(this.streamId).subscribe(
      (response) => {
        console.log('Stream info:', response);
        this.streamerName = response.owner.username;
        this.streamTitle = response.title;

        this.viewers = 24;
        this.likes = 15;


      },
      (error) => {
        console.error('Error loading stream info:', error);
      }
    );

    // Mock chat messages
    this.chatMessages = [
      {
        username: 'JaneDoe',
        message: "Hi everyone! Excited for today's stream!",
        timestamp: new Date(Date.now() - 300000),
        isCurrentUser: false,
      },
      {
        username: 'TechFan22',
        message: 'The audio is perfect today 👍',
        timestamp: new Date(Date.now() - 120000),
        isCurrentUser: false,
      },
      {
        username: this.streamerName,
        message:
          'Thanks for joining everyone! Let me know if you have questions.',
        timestamp: new Date(Date.now() - 60000),
        isCurrentUser: false,
      },
    ];
  }

  sendMessage(): void {
    if (this.currentMessage.trim() && this.hasJoined) {
      const newMessage = {
        username: this.guestName,
        message: this.currentMessage,
        timestamp: new Date(),
        isCurrentUser: true,
      };

      this.signalService.sendChatMessage(
        this.uniqueId,
        this.guestName,
        this.streamId,
        this.currentMessage
      );

      this.chatMessages.push(newMessage);
      this.currentMessage = '';

      this.scrollChatToBottom();

      // Message Simulation
      if (Math.random() > 0.7) {
        setTimeout(() => {
          const responses = [
            "That's interesting!",
            'I agree with you.',
            'Nice point!',
            'Thanks for sharing that!',
            '👍',
            '😊',
          ];

          const randomResponse =
            responses[Math.floor(Math.random() * responses.length)];

          this.chatMessages.push({
            username: this.streamerName,
            message: randomResponse,
            timestamp: new Date(),
            isCurrentUser: false,
          });
          this.scrollChatToBottom();
        }, 2000 + Math.random() * 3000);
      }
    }
  }

  likeStream(): void {
    this.likes++;
  }

  scrollChatToBottom(): void {
    setTimeout(() => {
      if (this.chatContainer) {
        this.chatContainer.nativeElement.scrollTop =
          this.chatContainer.nativeElement.scrollHeight;
      }
    }, 100);
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}
