import { Routes } from '@angular/router';

import { AuthGuard } from './guards/auth.guard';
import { LandingComponent } from './pages/landing/landing.component';
import { StreamComponent } from './pages/stream/stream.component';
import { StudioComponent } from './pages/studio/studio.component';
import { AuthComponent } from './pages/auth/auth.component';

export const routes: Routes = [
  {
    path: '',
    component: LandingComponent,
  },
  {
    path: 'login',
    component: AuthComponent,
    data: {isLogin: true}
  },
  {
    path: 'signup',
    component: AuthComponent,
    data: {isLogin: false}

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
