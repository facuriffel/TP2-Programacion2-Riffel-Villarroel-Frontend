import { Routes } from '@angular/router';

export const PACIENTE_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'mis-turnos' },
  {
    path: 'nuevo-turno',
    title: 'Solicitar turno',
    loadComponent: () => import('./paciente-nuevo-turno.component').then((m) => m.PacienteNuevoTurnoComponent),
  },
  {
    path: 'mis-turnos',
    title: 'Mis turnos',
    loadComponent: () => import('./paciente-mis-turnos.component').then((m) => m.PacienteMisTurnosComponent),
  },
  {
    path: 'datos',
    title: 'Mis datos personales',
    loadComponent: () => import('./paciente-datos.component').then((m) => m.PacienteDatosComponent),
  },
  { path: '**', redirectTo: '/404' },
];
