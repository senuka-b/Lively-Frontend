import { Component } from '@angular/core';
import { CreateStreamComponent } from '../create-stream/create-stream.component';
import { StreamShareLinkDemoComponent } from '../stream-share-link-demo/stream-share-link-demo.component';
import { StreamDemoComponent } from '../stream-demo/stream-demo.component';

@Component({
  selector: 'app-how-it-works-section',
  imports: [
    CreateStreamComponent,
    StreamShareLinkDemoComponent,
    StreamDemoComponent,
  ],
  templateUrl: './how-it-works-section.component.html',
  styleUrl: './how-it-works-section.component.css',
})
export class HowItWorksSectionComponent {}
