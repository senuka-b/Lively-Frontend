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

  private readonly rtcConfig = {
    iceServers: [
      {
        urls: [
          'stun:stun1.l.google.com:19302',
          'stun:stun2.l.google.com:19302',
        ],
      },
    ],
  };

  constructor(private signalService: SignalService) {}

  get localStreamValue(): MediaStream | null {
    return this.localStream;
  }

  getRemoteStream(viewerId: string): MediaStream | null {
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
    if (this.peerConnections.has(viewerId)) {
      this.peerConnections.get(viewerId)?.close();
    }

    const connection = new RTCPeerConnection(this.rtcConfig);
    this.peerConnections.set(viewerId, connection);

    // Create a new remote stream for this connection
    const remoteStream = new MediaStream();
    this.remoteStreams.set(viewerId, remoteStream);

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

        if (connection && sdp && sdp.type === "OFFER") {
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
                  type: "ANSWER",
                });
              })
              .catch((err) => console.error('Error handling offer:', err));
          } catch (e) {
            console.error('Error parsing SDP offer:', e);
          }
        }
      });

    // Listen for ICE candidates from streamer
    this.signalService
      .listenForICECandidate(streamCode, viewerId)
      .subscribe((candidate: IceCandidate) => {
        console.log('Received ICE candidate from streamer:', candidate);

        if (connection && candidate && candidate.type === 'OFFER') {
          try {
            const iceCandidate = new RTCIceCandidate(
              JSON.parse(candidate.candidateData)
            );
            if (!connection.remoteDescription) {
              return;
            }

            connection
              .addIceCandidate(iceCandidate)
              .then(() =>
                console.log('Viewer added ICE candidate from streamer')
              )
              .catch((err) =>
                console.error('Error adding received ICE candidate:', err)
              );
          } catch (e) {
            console.error('Error parsing ICE candidate:', e);
          }
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

    return connection;
  }

  public createStreamerRTCConnection(
    viewerId: string,
    streamCode: string
  ): RTCPeerConnection {
    console.log(`Creating streamer connection for viewer ${viewerId}`);

    // Clean up any existing connection for this viewer
    if (this.peerConnections.has(viewerId)) {
      this.peerConnections.get(viewerId)?.close();
    }

    if (!this.localStream) {
      console.error(
        'Local stream not initialized. Cannot create streamer connection.'
      );
      throw new Error('Local stream not initialized');
    }

    const connection = new RTCPeerConnection(this.rtcConfig);
    this.peerConnections.set(viewerId, connection);

    // Add all local tracks to the connection
    this.localStream.getTracks().forEach((track) => {
      console.log(
        `Adding ${track.kind} track to connection for viewer ${viewerId}`
      );
      connection.addTrack(track, this.localStream!);
    });

    // Listen for ICE candidates from viewer
    this.signalService
      .listenForICECandidate(streamCode, viewerId)
      .subscribe((candidate: IceCandidate) => {
        if (connection && candidate && candidate.type === 'ANSWER') {
          try {
            const iceCandidate = new RTCIceCandidate(
              JSON.parse(candidate.candidateData)
            );
            connection
              .addIceCandidate(iceCandidate)
              .then(() =>
                console.log('Streamer added ICE candidate from viewer')
              )
              .catch((err) =>
                console.error('Error adding received ICE candidate:', err)
              );
          } catch (e) {
            console.error('Error parsing ICE candidate:', e);
          }
        }
      });

    // Listen for SDP answers from viewer
    this.signalService
      .listenForSDP(streamCode, viewerId)
      .subscribe((sdp: SdpDescription) => {
        if (connection && sdp && sdp.type === "ANSWER") {
          try {
            const answer = new RTCSessionDescription(JSON.parse(sdp.sdp));
            connection
              .setRemoteDescription(answer)
              .then(() =>
                console.log('Streamer set remote description (answer)')
              )
              .catch((err) =>
                console.error('Error setting remote description:', err)
              );
          } catch (e) {
            console.error('Error parsing SDP answer:', e);
          }
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

    // Create and send offer to viewer
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
          type: "OFFER",
        });
      })
      .catch((err) => console.error('Error creating offer:', err));

    return connection;
  }

  async startLocalStream(streamType: string): Promise<void> {
    try {
      if (this.localStream) {
        this.localStream.getTracks().forEach((track) => track.stop());
      }

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

  async startStream(code: string, streamType: string): Promise<void> {
    await this.startLocalStream(streamType);
  }

  async stopStream(code: string): Promise<void> {
    // Stop and clear local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        track.stop();
        console.log(`Stopped ${track.kind} track`);
      });
      this.localStream = null;
    }

    // Close all peer connections
    this.peerConnections.forEach((connection, viewerId) => {
      connection.close();
      console.log(`Closed connection for ${viewerId}`);
    });

    this.peerConnections.clear();
    this.remoteStreams.clear();
  }
}
