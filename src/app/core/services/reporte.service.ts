import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/auth.models';
import {
    RangoFechas,
    RankingMedico,
    TasaCancelacion,
    TurnosPorEspecialidad,
    TurnosPorSede,
} from '../models/admin.models';

@Injectable({ providedIn: 'root' })
export class ReporteService {
    private http = inject(HttpClient);
    private url = `${environment.apiUrl}/reportes`;

    turnosPorEspecialidad(rango: RangoFechas): Observable<TurnosPorEspecialidad[]> {
        return this.http
            .get<ApiResponse<{ especialidades: TurnosPorEspecialidad[] }>>(`${this.url}/especialidades`, { params: this.params(rango) })
            .pipe(map((res) => res.datos.especialidades));
    }

    turnosPorSede(rango: RangoFechas): Observable<TurnosPorSede[]> {
        return this.http
            .get<ApiResponse<{ sedes: TurnosPorSede[] }>>(`${this.url}/sedes`, { params: this.params(rango) })
            .pipe(map((res) => res.datos.sedes));
    }

    rankingMedicos(rango: RangoFechas): Observable<RankingMedico[]> {
        return this.http
            .get<ApiResponse<{ ranking: RankingMedico[] }>>(`${this.url}/ranking-medicos`, { params: this.params(rango) })
            .pipe(map((res) => res.datos.ranking));
    }

    tasaCancelacion(rango: RangoFechas): Observable<TasaCancelacion> {
        return this.http
            .get<ApiResponse<TasaCancelacion>>(`${this.url}/tasa-cancelacion`, { params: this.params(rango) })
            .pipe(map((res) => res.datos));
    }

    private params(rango: RangoFechas): HttpParams {
        let params = new HttpParams();
        if (rango.desde) params = params.set('desde', rango.desde);
        if (rango.hasta) params = params.set('hasta', rango.hasta);
        return params;
    }
}
