import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/auth.models';
import { RegistroHistorial } from '../models/clinica.models';

@Injectable({ providedIn: 'root' })
export class HistorialService {
    private readonly http = inject(HttpClient);
    private readonly url = `${environment.apiUrl}/historial`;

    /** Para el paciente: todo su historial clínico. */
    propio(): Observable<RegistroHistorial[]> {
        return this.http
            .get<ApiResponse<RegistroHistorial[]>>(this.url)
            .pipe(map((res) => res.datos ?? []));
    }

    /** Para el médico: el backend devuelve solo registros de turnos atendidos por él. */
    porPaciente(idPaciente: number): Observable<RegistroHistorial[]> {
        const params = new HttpParams().set('id_paciente', idPaciente);
        return this.http
            .get<ApiResponse<RegistroHistorial[]>>(this.url, { params })
            .pipe(map((res) => res.datos ?? []));
    }
}
