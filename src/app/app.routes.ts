import { Routes } from '@angular/router';
export const routes: Routes = [
  {
    path: 'overview',
    title: 'Overview · Campus Desk',
    loadComponent: () => import('./features/overview').then((m) => m.Overview),
  },
  {
    path: 'students',
    title: 'Students · Campus Desk',
    loadComponent: () => import('./features/students').then((m) => m.Students),
  },
  {
    path: 'about',
    title: 'About · Campus Desk',
    loadComponent: () => import('./features/about').then((m) => m.About),
  },
  { path: '**', redirectTo: 'overview' },
];
