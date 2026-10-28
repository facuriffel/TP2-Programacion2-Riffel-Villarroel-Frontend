import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/auth.models';
import { AtencionPayload, Turno, TurnoPayload } from '../models/clinica.models';
import { NotificationService } from './notification.service';

@Injectable({ providedIn: 'root' })
export class TurnoService {
    private readonly http = inject(HttpClient);
    private readonly notificaciones = inject(NotificationService);
    private readonly url = `${environment.apiUrl}/turnos`;

    listar(filtros: { fecha?: string; id_sede?: number | null } = {}): Observable<Turno[]> {
        let params = new HttpParams();
        if (filtros.fecha) params = params.set('fecha', filtros.fecha);
        if (filtros.id_sede) params = params.set('id_sede', filtros.id_sede);
        return this.http
            .get<ApiResponse<{ turnos: Turno[] }>>(this.url, { params })
            .pipe(map((res) => res.datos.turnos));
    }

    fechasDisponibles(filtros: {
        id_medico: number;
        id_sede: number;
        id_especialidad: number;
    }): Observable<string[]> {
        const params = new HttpParams({ fromObject: { ...filtros } });
        return this.http
            .get<ApiResponse<{ fechas: string[] }>>(`${this.url}/fechas-disponibles`, { params })
            .pipe(map((res) => res.datos.fechas));
    }

    horariosLibres(filtros: {
        id_medico: number;
        id_sede: number;
        id_especialidad: number;
        fecha: string;
    }): Observable<string[]> {
        const params = new HttpParams({ fromObject: { ...filtros } });
        return this.http
            .get<ApiResponse<{ horarios: string[] }>>(`${this.url}/disponibilidad`, { params })
            .pipe(map((res) => res.datos.horarios));
    }

    crear(datos: TurnoPayload): Observable<string> {
        return this.http.post<ApiResponse<{ mensaje: string }>>(this.url, datos).pipe(
            map((res) => res.datos.mensaje),
            tap(() => this.notificaciones.refrescar()),
        );
    }

    cancelar(id: number): Observable<string> {
        return this.http.put<ApiResponse<{ mensaje: string }>>(`${this.url}/${id}/cancelar`, {}).pipe(
            map((res) => res.datos.mensaje),
            tap(() => this.notificaciones.refrescar()),
        );
    }

    atender(id: number, datos: AtencionPayload): Observable<string> {
        return this.http.put<ApiResponse<{ mensaje: string }>>(`${this.url}/${id}/atender`, datos).pipe(
            map((res) => res.datos.mensaje),
            tap(() => this.notificaciones.refrescar()),
        );
    }
}
