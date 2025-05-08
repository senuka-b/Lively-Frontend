import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { SignalService } from '../../service/signal/signal.service';
import { WebrtcService } from '../../service/webrtc/webrtc.service';
import { StreamService } from '../../service/stream/stream.service';
import { ChatService } from '../../service/chat/chat.service';
import { StreamInfo } from '../../model/StreamInfo';
import { streamQuality } from '../../model/util/StreamQuality';
import { StreamType } from '../../model/util/StreamType';

interface ChatMessage {
  username: string;
  message: string;
  timestamp: Date;
  isCurrentUser: boolean;
}


@Component({
  selector: 'app-stream',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './stream.component.html',
  styleUrl: './stream.component.css',
})
export class StreamComponent implements OnInit, OnDestroy {
  @ViewChild('videoPlayer', { static: false })
  videoPlayer!: ElementRef<HTMLVideoElement>;

  @ViewChild('chatContainer', { static: false })
  chatContainer!: ElementRef<HTMLDivElement>;

  streamCode: string = '';
  uniqueViewerId: string = crypto.randomUUID();
  
  guestName: string = '';
  hasJoined: boolean = false;
  
  streamInfo: StreamInfo = {
    title: '',
    streamerName: '',
    description: '',
    quality: streamQuality.FULL_HD,
    type: StreamType.WEBCAM,
    stats: {
      viewers: 0,
      likes: 0,
      duration: 0
    }
   
  };
  isStreamActive: boolean = true;
  hasEnded: boolean = false;
  
  currentMessage: string = '';
  chatMessages: ChatMessage[] = [];
  
  private streamCheckInterval?: number;
  
  private chatSubscription?: Subscription;
  private streamEndSubscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private webRtcService: WebrtcService,
    private streamService: StreamService,
    private chatService: ChatService
  ) {}

  ngOnInit(): void {
    this.initializeStream();
  }

  ngOnDestroy(): void {
    this.cleanupResources();
  }


  joinStream(): void {
    if (!this.guestName.trim()) {
      return;
    }
    
    this.hasJoined = true;
    console.log(`Joining stream ${this.streamCode} as ${this.guestName}`);
    
    this.connectToStream();
    this.setupChatConnection();
    this.addSystemMessage(`${this.guestName} has joined the stream`);
  }


  sendMessage(): void {
    if (!this.currentMessage.trim() || !this.hasJoined) {
      return;
    }

    const newMessage: ChatMessage = {
      username: this.guestName,
      message: this.currentMessage,
      timestamp: new Date(),
      isCurrentUser: true,
    };

    this.chatService.sendChatMessage(
      this.uniqueViewerId,
      this.guestName,
      this.streamCode,
      this.currentMessage
    );

    this.chatMessages.push(newMessage);
    this.currentMessage = '';
    this.scrollChatToBottom();

  }


  likeStream(): void {
    this.streamInfo.stats.likes++;
  }


  formatTime(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }


  private initializeStream(): void {
    const code = this.route.snapshot.paramMap.get('code');
    if (!code) {
      console.error('No stream code provided in the URL.');
      this.router.navigate(['/']);
      return;
    }
    
    this.streamCode = code;
    this.loadStreamInfo();
  }


  private loadStreamInfo(): void {
    this.streamService.getStream(this.streamCode).subscribe({
      next: (response) => {
        console.log('Stream info:', response);
        
        this.streamInfo.streamerName = response.owner.username;
        this.streamInfo.title = response.title;
        
        // TODO: Replace with actual viewer counts from server
        this.streamInfo.stats.viewers = 24;
        this.streamInfo.stats.likes = 15;
        
        this.setupStreamEndListener();
        this.loadInitialChatMessages();
      },
      error: (error) => {
        console.error('Error loading stream info:', error);
        // TODO: Show user-friendly error message
      }
    });
  }


  private connectToStream(): void {
    this.streamService.sendNewJoinMessage(this.streamCode, this.uniqueViewerId);
    console.log('Connecting with unique ID:', this.uniqueViewerId);

    this.webRtcService.createViewerRTCConnection(
      this.streamCode,
      this.uniqueViewerId
    );

    this.streamCheckInterval = window.setInterval(() => {
      const remoteStream = this.webRtcService.getRemoteStream(this.uniqueViewerId);
      
      if (remoteStream?.active && this.videoPlayer) {
        console.log('Setting video source to remote stream');
        this.videoPlayer.nativeElement.srcObject = remoteStream;
        this.videoPlayer.nativeElement.play()
          .then(() => console.log('Video playback started'))
          .catch((err) => console.error('Error playing video:', err));
        
        window.clearInterval(this.streamCheckInterval);
        this.streamCheckInterval = undefined;
      }
    }, 500);
  }


  private setupStreamEndListener(): void {
    this.streamEndSubscription = this.streamService
      .listenForStreamEnd(this.streamCode)
      .subscribe(() => {
        console.log('Stream has ended');
        this.hasEnded = true;
        this.isStreamActive = false;

        if (this.videoPlayer) {
          this.videoPlayer.nativeElement.srcObject = null;
          // Fallback video when stream ends
  
        }
      });
  }


  private setupChatConnection(): void {
    this.chatSubscription = this.chatService
      .listenForChatMessages(this.streamCode)
      .subscribe(chatMessage => {
        // Skip messages from self
        if (chatMessage.sender === this.uniqueViewerId) {
          return;
        }

        const message: ChatMessage = {
          username: chatMessage.senderGuestName,
          message: chatMessage.message,
          timestamp: new Date(),
          isCurrentUser: false,
        };
        
        this.chatMessages.push(message);
        this.scrollChatToBottom();
      });
  }


  private loadInitialChatMessages(): void {
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
        username: this.streamInfo.streamerName,
        message: 'Thanks for joining everyone! Let me know if you have questions.',
        timestamp: new Date(Date.now() - 60000),
        isCurrentUser: false,
      },
    ];
  }


  private addSystemMessage(message: string): void {
    this.chatMessages.push({
      username: 'System',
      message: message,
      timestamp: new Date(),
      isCurrentUser: false,
    });
    this.scrollChatToBottom();
  }




  private scrollChatToBottom(): void {
    setTimeout(() => {
      if (this.chatContainer) {
        this.chatContainer.nativeElement.scrollTop = 
          this.chatContainer.nativeElement.scrollHeight;
      }
    }, 100);
  }


  private cleanupResources(): void {
    if (this.streamCheckInterval) {
      window.clearInterval(this.streamCheckInterval);
    }
    
    [this.chatSubscription, this.streamEndSubscription].forEach(
      subscription => {
        if (subscription) {
          subscription.unsubscribe();
        }
      }
    );
  }
}