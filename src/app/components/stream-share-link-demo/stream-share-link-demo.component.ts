import { Component } from '@angular/core';

@Component({
  selector: 'app-stream-share-link-demo',
  imports: [],
  templateUrl: './stream-share-link-demo.component.html',
  styleUrl: './stream-share-link-demo.component.css',
})
export class StreamShareLinkDemoComponent {
  get streamLink(): string {
    return window.location.origin + '/tech-conference-2025';
  }
}
