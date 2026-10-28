import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { NotificadorService, mensajeDeError } from '../services/notificador.service';
import { environment } from '../../../environments/environment';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const notificador = inject(NotificadorService);
    const esLogin = req.url === `${environment.apiUrl}/auth/login`;

    return next(req).pipe(
        catchError((err: HttpErrorResponse) => {
            if (err.status === 401 && !esLogin) {
                authService.logout();
                notificador.error('Su sesión expiró. Iniciá sesión nuevamente.');
            } else if (err.status === 0) {
                notificador.error('No se pudo conectar con el servidor. Intentá nuevamente en unos minutos.');
            } else if (err.status >= 500) {
                notificador.error(mensajeDeError(err, 'El servidor devolvió un error inesperado.'));
            }
            return throwError(() => err);
        })
    );
};
