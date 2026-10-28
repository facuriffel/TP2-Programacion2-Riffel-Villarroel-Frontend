import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiResponse, Notificacion } from '../models/auth.models';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class NotificationService {
    private readonly http = inject(HttpClient);
    private readonly authService = inject(AuthService);
    private readonly url = `${environment.apiUrl}/notificaciones`;

    readonly notificaciones = signal<Notificacion[]>([]);
    readonly cargando = signal(false);
    readonly noLeidas = computed(() => this.notificaciones().filter((n) => !n.leida).length);

    constructor() {
        effect(() => {
            if (this.authService.currentUser()) {
                this.refrescar();
            } else {
                this.notificaciones.set([]);
            }
        });
    }

    /** Vuelve a consultar la API; llamar después de confirmar, cancelar o atender un turno. */
    refrescar(): void {
        this.cargando.set(true);
        this.http.get<ApiResponse<{ notificaciones: Notificacion[] }>>(this.url).subscribe({
            next: (res) => {
                this.notificaciones.set(res.datos.notificaciones ?? []);
                this.cargando.set(false);
            },
            error: () => this.cargando.set(false),
        });
    }

    marcarLeida(id: number): void {
        const anteriores = this.notificaciones();
        this.notificaciones.set(anteriores.map((n) => (n.id === id ? { ...n, leida: true } : n)));
        this.http.put(`${this.url}/${id}/leida`, {}).subscribe({
            error: () => this.notificaciones.set(anteriores),
        });
    }
}
