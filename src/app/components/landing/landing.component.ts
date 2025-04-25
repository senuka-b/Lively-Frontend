import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing',
  imports: [],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent {

  constructor(private router: Router) {}

  get currentURL() {
    return window.location.origin + "/watch/a";
  }

  login(): void {
    this.router.navigate(['/login']);
  }

  signup(): void {
    this.router.navigate(['/signup']);
  }
}
