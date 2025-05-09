import { Component } from '@angular/core';

@Component({
  selector: 'app-stream-share-link',
  imports: [],
  templateUrl: './stream-share-link.component.html',
  styleUrl: './stream-share-link.component.css'
})
export class StreamShareLinkComponent {
  get streamLink() : string {
    return window.location.origin+"/tech-conference-2025"
  }
}
