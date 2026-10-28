import { Injectable, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

export function mensajeDeError(err: unknown, mensajePorDefecto: string): string {
    if (err instanceof HttpErrorResponse) {
        return err.error?.datos?.mensaje ?? mensajePorDefecto;
    }
    return mensajePorDefecto;
}

@Injectable({ providedIn: 'root' })
export class NotificadorService {
    private snackBar = inject(MatSnackBar);

    exito(mensaje: string): void {
        this.snackBar.open(mensaje, 'Cerrar', { duration: 3500 });
    }

    error(mensaje: string): void {
        this.snackBar.open(mensaje, 'Cerrar', { duration: 6000, panelClass: 'snackbar-error' });
    }

    errorApi(err: unknown, mensajePorDefecto = 'No se pudo completar la operación'): void {
        if (err instanceof HttpErrorResponse && (err.status === 0 || err.status === 401 || err.status >= 500)) {
            return;
        }
        this.error(mensajeDeError(err, mensajePorDefecto));
    }
}
