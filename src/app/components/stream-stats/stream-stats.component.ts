import { Component } from '@angular/core';
import { StreamInfo } from '../../model/StreamInfo';
import { streamQuality } from '../../model/util/StreamQuality';
import { StreamType } from '../../model/util/StreamType';

@Component({
  selector: 'app-stream-stats',
  imports: [],
  templateUrl: './stream-stats.component.html',
  styleUrl: './stream-stats.component.css'
})
export class StreamStatsComponent {
  streamInfo: StreamInfo = {
    title: '',
    code: '',
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

}
