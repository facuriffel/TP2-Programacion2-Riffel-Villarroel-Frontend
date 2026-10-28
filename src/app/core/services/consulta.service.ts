import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/auth.models';
import { Especialidad, Sede } from '../models/admin.models';
import { MedicoResumen, PacienteResumen } from '../models/clinica.models';

/** Catálogos de solo lectura disponibles para médico, operador y paciente. */
@Injectable({ providedIn: 'root' })
export class ConsultaService {
    private readonly http = inject(HttpClient);
    private readonly url = `${environment.apiUrl}/consultas`;

    sedes(): Observable<Sede[]> {
        return this.http
            .get<ApiResponse<{ sedes: Sede[] }>>(`${this.url}/sedes`)
            .pipe(map((res) => res.datos.sedes));
    }

    especialidades(): Observable<Especialidad[]> {
        return this.http
            .get<ApiResponse<{ especialidades: Especialidad[] }>>(`${this.url}/especialidades`)
            .pipe(map((res) => res.datos.especialidades));
    }

    medicos(filtros: { id_sede?: number | null; id_especialidad?: number | null } = {}): Observable<MedicoResumen[]> {
        let params = new HttpParams();
        if (filtros.id_sede) params = params.set('id_sede', filtros.id_sede);
        if (filtros.id_especialidad) params = params.set('id_especialidad', filtros.id_especialidad);
        return this.http
            .get<ApiResponse<{ medicos: MedicoResumen[] }>>(`${this.url}/medicos`, { params })
            .pipe(map((res) => res.datos.medicos));
    }

    pacientes(filtros: { dni?: string; apellido?: string }): Observable<PacienteResumen[]> {
        let params = new HttpParams();
        if (filtros.dni) params = params.set('dni', filtros.dni);
        if (filtros.apellido) params = params.set('apellido', filtros.apellido);
        return this.http
            .get<ApiResponse<{ pacientes: PacienteResumen[] }>>(`${this.url}/pacientes`, { params })
            .pipe(map((res) => res.datos.pacientes));
    }
}
