import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { RegistroComponent } from './features/auth/registro/registro.component';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'registro', component: RegistroComponent },
    // Aca tus rutas fede: protegidas, el layout y las páginas 404/acceso-denegado.
];