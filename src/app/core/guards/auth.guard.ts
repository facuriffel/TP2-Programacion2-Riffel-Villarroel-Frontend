import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isLoggedIn()) {
        return true;
    }

    router.navigate(['/login']);
    return false;
};

export const roleGuard = (rolesPermitidos: string[]): CanActivateFn => {
    return () => {
        const authService = inject(AuthService);
        const router = inject(Router);
        const usuario = authService.currentUser();

        if (usuario && rolesPermitidos.includes(usuario.rol)) {
            return true;
        }

        router.navigate(['/acceso-denegado']);
        return false;
    };
};