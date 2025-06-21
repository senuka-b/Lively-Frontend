import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StreamInfo } from '../../model/StreamInfo';
import { streamQuality } from '../../model/util/StreamQuality';
import { StreamType } from '../../model/util/StreamType';
import { StreamService } from '../../service/stream/stream.service';

@Component({
  selector: 'app-stream-info',
  imports: [FormsModule],
  templateUrl: './stream-info.component.html',
  styleUrl: './stream-info.component.css'
})
export class StreamInfoComponent implements OnInit {

  streamInfo?: StreamInfo;
  isLive?: boolean;

  constructor(private streamService: StreamService) { }

  ngOnInit(): void {
    this.streamService.streamInfo$.subscribe((streamInfo) => this.streamInfo = streamInfo)
    this.streamService.isLive$.subscribe((isLive) => this.isLive = isLive);
  }

  onStreamInfoChange($event: string) {
    this.streamService.streamInfo$ = this.streamInfo!;

  }



}
