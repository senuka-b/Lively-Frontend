import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StreamInfo } from '../../model/StreamInfo';
import { streamQuality } from '../../model/util/StreamQuality';
import { StreamType } from '../../model/util/StreamType';

@Component({
  selector: 'app-stream-info',
  imports: [FormsModule],
  templateUrl: './stream-info.component.html',
  styleUrl: './stream-info.component.css'
})
export class StreamInfoComponent {
  streamCode: string = "STREAM_CODE";
  streamTitle: string = '';
  streamDescription: string = '';

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
