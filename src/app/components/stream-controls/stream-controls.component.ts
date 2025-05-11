import { Component } from '@angular/core';
import { StreamInfo } from '../../model/StreamInfo';
import { streamQuality } from '../../model/util/StreamQuality';
import { StreamType } from '../../model/util/StreamType';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stream-controls',
  imports: [CommonModule],
  templateUrl: './stream-controls.component.html',
  styleUrl: './stream-controls.component.css'
})
export class StreamControlsComponent {

  streamInfo: StreamInfo = {
    title: '',
    description: '',
    streamerName: '',
    quality: streamQuality.FULL_HD,
    type: StreamType.WEBCAM,
    stats: {
      viewers: 0,
      likes: 0,
      duration: 0
    }
  }

  isLive = false;
}