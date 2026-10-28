import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/auth.models';
import { FiltrosAuditoria, LogAuditoria, Pagina } from '../models/admin.models';

interface ListadoLogs {
    logs: LogAuditoria[];
    total: number;
}

@Injectable({ providedIn: 'root' })
export class AuditoriaService {
    private http = inject(HttpClient);
    private url = `${environment.apiUrl}/auditoria`;

    listar(filtros: FiltrosAuditoria, pagina: number, limite: number): Observable<Pagina<LogAuditoria>> {
        let params = new HttpParams().set('pagina', pagina).set('limite', limite);
        if (filtros.usuario) params = params.set('usuario', filtros.usuario);
        if (filtros.entidad) params = params.set('entidad', filtros.entidad);
        if (filtros.desde) params = params.set('desde', filtros.desde);
        if (filtros.hasta) params = params.set('hasta', filtros.hasta);

        return this.http
            .get<ApiResponse<ListadoLogs>>(this.url, { params })
            .pipe(map((res) => ({ items: res.datos.logs, total: res.datos.total })));
    }
}
