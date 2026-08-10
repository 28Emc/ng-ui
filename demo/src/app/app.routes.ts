import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'inputs',
  },
  {
    path: 'inputs',
    loadComponent: () => import('./pages/inputs/inputs').then((m) => m.InputsPage),
  },
  {
    path: 'overlays',
    loadComponent: () => import('./pages/overlays/overlays').then((m) => m.OverlaysPage),
  },
  {
    path: 'feedback',
    loadComponent: () => import('./pages/feedback/feedback').then((m) => m.FeedbackPage),
  },
  {
    path: 'layout',
    loadComponent: () => import('./pages/layout/layout').then((m) => m.LayoutPage),
  },
  {
    path: 'advanced',
    loadComponent: () => import('./pages/advanced/advanced').then((m) => m.AdvancedPage),
  },
  {
    path: '**',
    redirectTo: 'inputs',
  },
];
