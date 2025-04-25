import { Routes } from '@angular/router';
import { LandingComponent } from './components/landing/landing.component';
import { StreamComponent } from './components/stream/stream.component';
import { StudioComponent } from './components/studio/studio.component';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: LandingComponent,
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'signup',
    component: SignupComponent,
  },
  {
    path: 'watch/:code',
    component: StreamComponent,
  },
  {
    path: 'studio',
    component: StudioComponent,
    canActivate: [AuthGuard],
  },
];
