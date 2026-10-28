import { Routes } from '@angular/router';
import { COBERTURAS_CONFIG, ESPECIALIDADES_CONFIG, SEDES_CONFIG } from './catalogos/catalogo.config';

export const ADMIN_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'reportes' },
  {
    path: 'reportes',
    title: 'Reportes',
    loadComponent: () => import('./dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'usuarios',
    title: 'Usuarios',
    loadComponent: () => import('./usuarios/usuarios-list.component').then((m) => m.UsuariosListComponent),
  },
  {
    path: 'sedes',
    title: 'Sedes',
    data: { catalogo: SEDES_CONFIG },
    loadComponent: () => import('./catalogos/catalogo-list.component').then((m) => m.CatalogoListComponent),
  },
  {
    path: 'especialidades',
    title: 'Especialidades',
    data: { catalogo: ESPECIALIDADES_CONFIG },
    loadComponent: () => import('./catalogos/catalogo-list.component').then((m) => m.CatalogoListComponent),
  },
  {
    path: 'coberturas',
    title: 'Coberturas',
    data: { catalogo: COBERTURAS_CONFIG },
    loadComponent: () => import('./catalogos/catalogo-list.component').then((m) => m.CatalogoListComponent),
  },
  {
    path: 'auditoria',
    title: 'Auditoría',
    loadComponent: () => import('./auditoria/auditoria.component').then((m) => m.AuditoriaComponent),
  },
  { path: '**', redirectTo: '/404' },
];
