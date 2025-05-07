import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { StudioComponent } from "./components/studio/studio.component";
import { StreamComponent } from "./components/stream/stream.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, StudioComponent, StreamComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Lively-Frontend';
}
