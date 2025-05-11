import { Component } from '@angular/core';
import { StreamInfo } from '../../model/StreamInfo';
import { streamQuality } from '../../model/util/StreamQuality';
import { StreamType } from '../../model/util/StreamType';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-stream-quick-settings',
  imports: [FormsModule],
  templateUrl: './stream-quick-settings.component.html',
  styleUrl: './stream-quick-settings.component.css'
})
export class StreamQuickSettingsComponent {
  isLive = false;

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

}
