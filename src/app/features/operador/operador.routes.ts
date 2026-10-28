import { Routes } from '@angular/router';

export const OPERADOR_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'agenda' },
  {
    path: 'agenda',
    title: 'Agenda de médicos',
    loadComponent: () => import('./operador-agenda.component').then((m) => m.OperadorAgendaComponent),
  },
  {
    path: 'turnos',
    title: 'Turnos de la sede',
    loadComponent: () => import('./operador-turnos.component').then((m) => m.OperadorTurnosComponent),
  },
  {
    path: 'asignar-turno',
    title: 'Asignar turno',
    loadComponent: () =>
      import('./operador-asignar-turno.component').then((m) => m.OperadorAsignarTurnoComponent),
  },
  {
    path: 'pacientes',
    title: 'Alta de pacientes',
    loadComponent: () => import('./operador-pacientes.component').then((m) => m.OperadorPacientesComponent),
  },
  { path: '**', redirectTo: '/404' },
];
