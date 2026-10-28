import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/guards/auth.guard';
import { HomeComponent } from './features/home/home.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegistroComponent } from './features/auth/registro/registro.component';
import { PerfilComponent } from './features/perfil/perfil.component';
import { AccesoDenegadoComponent } from './features/errors/acceso-denegado/acceso-denegado.component';
import { NotFoundComponent } from './features/errors/not-found/not-found.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, pathMatch: 'full' },

  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },

  {
    path: 'perfil',
    component: PerfilComponent,
    canActivate: [authGuard],
  },

  { path: 'acceso-denegado', component: AccesoDenegadoComponent },

  {
    path: 'admin',
    canActivate: [authGuard, roleGuard(['administrador'])],
    loadChildren: () => import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },
  {
    path: 'medico',
    canActivate: [authGuard, roleGuard(['medico'])],
    loadChildren: () => import('./features/medico/medico.routes').then((m) => m.MEDICO_ROUTES),
  },
  {
    path: 'operador',
    canActivate: [authGuard, roleGuard(['operador'])],
    loadChildren: () => import('./features/operador/operador.routes').then((m) => m.OPERADOR_ROUTES),
  },
  {
    path: 'paciente',
    canActivate: [authGuard, roleGuard(['paciente'])],
    loadChildren: () => import('./features/paciente/paciente.routes').then((m) => m.PACIENTE_ROUTES),
  },

  { path: '404', component: NotFoundComponent },
  { path: '**', redirectTo: '404' },
];
