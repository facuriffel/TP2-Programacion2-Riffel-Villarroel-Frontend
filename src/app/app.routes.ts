import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/guards/auth.guard';
import { HomeComponent } from './features/home/home.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegistroComponent } from './features/auth/registro/registro.component';
import { PerfilComponent } from './features/perfil/perfil.component';
import { EnConstruccionComponent } from './features/shared/en-construccion/en-construccion.component';
import { AccesoDenegadoComponent } from './features/errors/acceso-denegado/acceso-denegado.component';
import { NotFoundComponent } from './features/errors/not-found/not-found.component';

export const routes: Routes = [
  // Ruta pública principal
  { path: '', component: HomeComponent, pathMatch: 'full' },

  // Rutas de Autenticación
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },

  // Rutas protegidas generales
  {
    path: 'perfil',
    component: PerfilComponent,
    canActivate: [authGuard],
  },
  {
    path: 'en-construccion',
    component: EnConstruccionComponent,
    canActivate: [authGuard],
  },

  // Páginas de error
  { path: 'acceso-denegado', component: AccesoDenegadoComponent },

  // Rutas protegidas por Rol (Semana 1: Módulos en construcción)
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard(['administrador'])],
    children: [
      { path: '', component: EnConstruccionComponent },
      { path: '**', component: EnConstruccionComponent },
    ],
  },
  {
    path: 'medico',
    canActivate: [authGuard, roleGuard(['medico'])],
    children: [
      { path: '', component: EnConstruccionComponent },
      { path: '**', component: EnConstruccionComponent },
    ],
  },
  {
    path: 'operador',
    canActivate: [authGuard, roleGuard(['operador'])],
    children: [
      { path: '', component: EnConstruccionComponent },
      { path: '**', component: EnConstruccionComponent },
    ],
  },
  {
    path: 'paciente',
    canActivate: [authGuard, roleGuard(['paciente'])],
    children: [
      { path: '', component: EnConstruccionComponent },
      { path: '**', component: EnConstruccionComponent },
    ],
  },

  // Ruta 404 y redirección comodín
  { path: '404', component: NotFoundComponent },
  { path: '**', redirectTo: '404' },
];