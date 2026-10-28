import { Routes } from '@angular/router';

export const MEDICO_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'turnos' },
  {
    path: 'agenda',
    title: 'Mi agenda',
    loadComponent: () => import('./medico-agenda.component').then((m) => m.MedicoAgendaComponent),
  },
  {
    path: 'turnos',
    title: 'Turnos programados',
    loadComponent: () => import('./medico-turnos.component').then((m) => m.MedicoTurnosComponent),
  },
  {
    path: 'historial',
    title: 'Historial clínico',
    loadComponent: () => import('./medico-historial.component').then((m) => m.MedicoHistorialComponent),
  },
  { path: '**', redirectTo: '/404' },
];
