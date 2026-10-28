import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/auth.models';
import { AgendaItem, AgendaPayload, FiltrosAgenda } from '../models/clinica.models';

@Injectable({ providedIn: 'root' })
export class AgendaService {
    private readonly http = inject(HttpClient);
    private readonly url = `${environment.apiUrl}/agenda`;

    listar(filtros: FiltrosAgenda = {}): Observable<AgendaItem[]> {
        let params = new HttpParams();
        if (filtros.fecha) params = params.set('fecha', filtros.fecha);
        if (filtros.desde) params = params.set('desde', filtros.desde);
        if (filtros.id_sede) params = params.set('id_sede', filtros.id_sede);
        if (filtros.id_medico) params = params.set('id_medico', filtros.id_medico);
        return this.http
            .get<ApiResponse<{ agenda: AgendaItem[] }>>(this.url, { params })
            .pipe(map((res) => res.datos.agenda));
    }

    crear(datos: AgendaPayload): Observable<string> {
        return this.http
            .post<ApiResponse<{ mensaje: string }>>(this.url, datos)
            .pipe(map((res) => res.datos.mensaje));
    }

    modificar(id: number, datos: AgendaPayload): Observable<string> {
        return this.http
            .put<ApiResponse<{ mensaje: string }>>(`${this.url}/${id}`, datos)
            .pipe(map((res) => res.datos.mensaje));
    }

    eliminar(id: number): Observable<string> {
        return this.http
            .delete<ApiResponse<{ mensaje: string }>>(`${this.url}/${id}`)
            .pipe(map((res) => res.datos.mensaje));
    }
}
