import { Routes } from '@angular/router';

import { AuthGuard } from './guards/auth.guard';
import { LandingComponent } from './pages/landing/landing.component';
import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';
import { StreamComponent } from './pages/stream/stream.component';
import { StudioComponent } from './pages/studio/studio.component';

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
