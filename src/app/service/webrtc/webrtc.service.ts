import { Injectable } from '@angular/core';
import { CandidateDescriptionType } from '../../model/util/CandidateDescriptionType';
import { SignalService } from '../signal/signal.service';
import { IceCandidate } from '../../model/IceCandidate';
import { SdpDescription } from '../../model/SdpDescription';

@Injectable({
  providedIn: 'root',
})
export class WebrtcService {
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private localStream: MediaStream | null = null;
  private remoteStreams: Map<string, MediaStream> = new Map();

  private readonly rtcConfig: RTCConfiguration = {
    iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun.l.google.com:5349" },
        { urls: "stun:stun1.l.google.com:3478" },
        { urls: "stun:stun1.l.google.com:5349" },
        { urls: "stun:stun2.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:5349" },
        { urls: "stun:stun3.l.google.com:3478" },
        { urls: "stun:stun3.l.google.com:5349" },
        { urls: "stun:stun4.l.google.com:19302" },
        { urls: "stun:stun4.l.google.com:5349" }
    ],
  };

  constructor(private signalService: SignalService) {}


  get localStreamValue(): MediaStream | null {
    return this.localStream;
  }


  public getRemoteStream(viewerId: string): MediaStream | null {
    return this.remoteStreams.get(viewerId) || null;
  }


  public createViewerRTCConnection(
    streamCode: string,
    viewerId: string
  ): RTCPeerConnection {
    console.log(
      `Creating viewer connection for ${viewerId} in stream ${streamCode}`
    );

    // Clean up any existing connection for this viewer
    this.closeExistingConnection(viewerId);

    const connection = new RTCPeerConnection(this.rtcConfig);
    this.peerConnections.set(viewerId, connection);

    // Create a new remote stream for this connection
    const remoteStream = new MediaStream();
    this.remoteStreams.set(viewerId, remoteStream);

    this.setupViewerConnectionListeners(connection, remoteStream, streamCode, viewerId);

    return connection;
  }


  public createStreamerRTCConnection(
    viewerId: string,
    streamCode: string
  ): RTCPeerConnection {
    console.log(`Creating streamer connection for viewer ${viewerId}`);

    // Clean up any existing connection for this viewer
    this.closeExistingConnection(viewerId);

    if (!this.localStream) {
      console.error(
        'Local stream not initialized. Cannot create streamer connection.'
      );
      throw new Error('Local stream not initialized');
    }

    const connection = new RTCPeerConnection(this.rtcConfig);
    this.peerConnections.set(viewerId, connection);

    this.addLocalTracksToConnection(connection, viewerId);
    this.setupStreamerConnectionListeners(connection, streamCode, viewerId);
    this.createAndSendOffer(connection, streamCode, viewerId);

    return connection;
  }


  public async startStream(streamType: string): Promise<void> {
      await this.startLocalStream(streamType);
  }

  public async stopStream(): Promise<void> {
    this.stopLocalStreamTracks();
    this.closeAllConnections();
    this.localStream = null;
    this.remoteStreams.clear();
  }

  private async startLocalStream(streamType: string): Promise<void> {
    try {
      this.stopLocalStreamTracks();

      this.localStream =
        streamType === 'Webcam'
          ? await navigator.mediaDevices.getUserMedia({
              video: true,
              audio: true,
            })
          : await navigator.mediaDevices.getDisplayMedia({
              video: true,
              audio: true,
            });

      console.log(
        `Local ${streamType} stream started with ${
          this.localStream.getTracks().length
        } tracks`
      );
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw error;
    }
  }



  // ============= PRIVATE HELPER METHODS =============


  private closeExistingConnection(viewerId: string): void {
    if (this.peerConnections.has(viewerId)) {
      this.peerConnections.get(viewerId)?.close();
    }
  }


  private stopLocalStreamTracks(): void {
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        track.stop();
        console.log(`Stopped ${track.kind} track`);
      });
    }
  }


  private closeAllConnections(): void {
    this.peerConnections.forEach((connection, viewerId) => {
      connection.close();
      console.log(`Closed connection for ${viewerId}`);
    });
    this.peerConnections.clear();
  }


  private setupViewerConnectionListeners(
    connection: RTCPeerConnection,
    remoteStream: MediaStream,
    streamCode: string,
    viewerId: string
  ): void {
    // Handle incoming tracks
    connection.ontrack = (event) => {
      console.log(`Viewer ${viewerId} received track:`, event.track.kind);
      remoteStream.addTrack(event.track);
    };

    // Listen for SDP offers from streamer
    this.signalService
      .listenForSDP(streamCode, viewerId)
      .subscribe((sdp: SdpDescription) => {
        console.log('Received SDP offer from streamer:', sdp);

        if (connection && sdp && sdp.type === 'OFFER') {
          this.handleViewerSdpOffer(connection, sdp, streamCode, viewerId);
        }
      });

    // Listen for ICE candidates from streamer
    this.signalService
      .listenForICECandidate(streamCode, viewerId)
      .subscribe((candidate: IceCandidate) => {
        console.log('Received ICE candidate from streamer:', candidate);

        if (connection && candidate && candidate.type === 'OFFER') {
          this.handleReceivedIceCandidate(connection, candidate);
        }
      });

    // Generate and send ICE candidates to streamer
    connection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('Viewer generated ICE candidate');
        const candidate: IceCandidate = {
          candidateData: JSON.stringify(event.candidate.toJSON()),
          type: 'ANSWER',
        };
        this.signalService.sendICECandidate(streamCode, viewerId, candidate);
      }
    };

    connection.oniceconnectionstatechange = () => {
      console.log(
        `Viewer ICE connection state: ${connection.iceConnectionState}`
      );
    };
  }


  private handleViewerSdpOffer(
    connection: RTCPeerConnection,
    sdp: SdpDescription,
    streamCode: string,
    viewerId: string
  ): void {
    try {
      const offer = new RTCSessionDescription(JSON.parse(sdp.sdp));

      connection
        .setRemoteDescription(offer)
        .then(() => {
          console.log('Viewer set remote description (offer)');
          return connection.createAnswer();
        })
        .then((answer) => {
          console.log('Viewer created answer');
          return connection.setLocalDescription(answer);
        })
        .then(() => {
          console.log('Viewer set local description (answer)');
          // Send answer back to streamer
          this.signalService.sendSDP(streamCode, viewerId, {
            sdp: JSON.stringify(connection.localDescription),
            type: 'ANSWER',
          });
        })
        .catch((err) => console.error('Error handling offer:', err));
    } catch (e) {
      console.error('Error parsing SDP offer:', e);
    }
  }


  private setupStreamerConnectionListeners(
    connection: RTCPeerConnection,
    streamCode: string,
    viewerId: string
  ): void {
    // Listen for ICE candidates from viewer
    this.signalService
      .listenForICECandidate(streamCode, viewerId)
      .subscribe((candidate: IceCandidate) => {
        if (connection && candidate && candidate.type === 'ANSWER') {
          this.handleReceivedIceCandidate(connection, candidate);
        }
      });

    // Listen for SDP answers from viewer
    this.signalService
      .listenForSDP(streamCode, viewerId)
      .subscribe((sdp: SdpDescription) => {
        if (connection && sdp && sdp.type === 'ANSWER') {
          this.handleStreamerSdpAnswer(connection, sdp);
        }
      });

    // Generate and send ICE candidates to viewer
    connection.onicecandidate = (event) => {
      if (event.candidate) {
        const candidate: IceCandidate = {
          candidateData: JSON.stringify(event.candidate.toJSON()),
          type: 'OFFER',
        };

        console.log('Streamer generated OFFER ICE candidate', candidate);
        this.signalService.sendICECandidate(streamCode, viewerId, candidate);
      }
    };

    connection.oniceconnectionstatechange = () => {
      console.log(
        `Streamer ICE connection state for ${viewerId}: ${connection.iceConnectionState}`
      );
    };
  }


  private handleReceivedIceCandidate(
    connection: RTCPeerConnection,
    candidate: IceCandidate
  ): void {
    try {
      const iceCandidate = new RTCIceCandidate(
        JSON.parse(candidate.candidateData)
      );
      
      // For viewer connections, ensure we have a remote description before adding candidates
      if (candidate.type === 'OFFER' && !connection.remoteDescription) {
        return;
      }

      connection
        .addIceCandidate(iceCandidate)
        .then(() => console.log(`Added ICE candidate type: ${candidate.type}`))
        .catch((err) =>
          console.error('Error adding received ICE candidate:', err)
        );
    } catch (e) {
      console.error('Error parsing ICE candidate:', e);
    }
  }


  private handleStreamerSdpAnswer(
    connection: RTCPeerConnection,
    sdp: SdpDescription
  ): void {
    try {
      const answer = new RTCSessionDescription(JSON.parse(sdp.sdp));
      connection
        .setRemoteDescription(answer)
        .then(() => console.log('Streamer set remote description (answer)'))
        .catch((err) => console.error('Error setting remote description:', err));
    } catch (e) {
      console.error('Error parsing SDP answer:', e);
    }
  }


  private addLocalTracksToConnection(
    connection: RTCPeerConnection,
    viewerId: string
  ): void {
    if (!this.localStream) return;
    
    this.localStream.getTracks().forEach((track) => {
      console.log(
        `Adding ${track.kind} track to connection for viewer ${viewerId}`
      );
      connection.addTrack(track, this.localStream!);
    });
  }


  private createAndSendOffer(
    connection: RTCPeerConnection,
    streamCode: string,
    viewerId: string
  ): void {
    connection
      .createOffer()
      .then((offer) => {
        console.log('Streamer created offer');
        return connection.setLocalDescription(offer);
      })
      .then(() => {
        console.log('Streamer set local description (offer)');
        this.signalService.sendSDP(streamCode, viewerId, {
          sdp: JSON.stringify(connection.localDescription),
          type: 'OFFER',
        });
      })
      .catch((err) => console.error('Error creating offer:', err));
  }
}