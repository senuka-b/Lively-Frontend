import { Component } from '@angular/core';
import { CreateStreamComponent } from '../create-stream/create-stream.component';
import { StreamShareLinkComponent } from "../stream-share-link/stream-share-link.component";
import { StreamDemoComponent } from "../stream-demo/stream-demo.component";

@Component({
  selector: 'app-how-it-works-section',
  imports: [CreateStreamComponent, StreamShareLinkComponent, StreamDemoComponent],
  templateUrl: './how-it-works-section.component.html',
  styleUrl: './how-it-works-section.component.css',
})
export class HowItWorksSectionComponent {}
