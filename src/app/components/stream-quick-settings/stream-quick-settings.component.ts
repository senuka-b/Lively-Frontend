import { Component, OnInit } from '@angular/core';
import { StreamInfo } from '../../model/StreamInfo';
import { streamQuality } from '../../model/util/StreamQuality';
import { StreamType } from '../../model/util/StreamType';
import { FormsModule } from '@angular/forms';
import { StreamService } from '../../service/stream/stream.service';

@Component({
  selector: 'app-stream-quick-settings',
  imports: [FormsModule],
  templateUrl: './stream-quick-settings.component.html',
  styleUrl: './stream-quick-settings.component.css'
})
export class StreamQuickSettingsComponent implements OnInit {
  isLive = false;

  streamInfo?: StreamInfo;

  constructor(private streamService: StreamService) {}

  ngOnInit(): void {
    this.streamService.streamInfo$.subscribe((streamInfo) => this.streamInfo = streamInfo);
  }

  updateStreamInfo() {
    this.streamService.streamInfo$ = this.streamInfo!;
  }

}
