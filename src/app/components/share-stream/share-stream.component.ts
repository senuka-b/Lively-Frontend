import { Component } from '@angular/core';

@Component({
  selector: 'app-share-stream',
  imports: [],
  templateUrl: './share-stream.component.html',
  styleUrl: './share-stream.component.css'
})
export class ShareStreamComponent {
  streamURL = window.location.origin + "/stream/awesome-stream"
}
