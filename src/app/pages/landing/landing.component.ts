import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NavbarComponent } from "../../components/navbar/navbar.component";
import { HeroSectionComponent } from "../../components/hero-section/hero-section.component";
import { FeaturesSectionComponent } from "../../components/features-section/features-section.component";
import { HowItWorksSectionComponent } from "../../components/how-it-works-section/how-it-works-section.component";
import { GetStartedComponent } from "../../components/get-started/get-started.component";
import { FooterComponent } from "../../components/footer/footer.component";
import { StreamShareLinkDemoComponent } from "../../components/stream-share-link-demo/stream-share-link-demo.component";

@Component({
  selector: 'app-landing',
  imports: [NavbarComponent, HeroSectionComponent, FeaturesSectionComponent, HowItWorksSectionComponent, GetStartedComponent, FooterComponent, StreamShareLinkDemoComponent],
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
