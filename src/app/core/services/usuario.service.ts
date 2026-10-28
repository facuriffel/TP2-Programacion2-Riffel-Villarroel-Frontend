import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/auth.models';
import { FiltrosUsuarios, Pagina, UsuarioAdmin, UsuarioPayload } from '../models/admin.models';

interface ListadoUsuarios {
    usuarios: UsuarioAdmin[];
    total: number;
}

@Injectable({ providedIn: 'root' })
export class UsuarioService {
    private http = inject(HttpClient);
    private url = `${environment.apiUrl}/usuarios`;

    listar(filtros: FiltrosUsuarios, pagina: number, limite: number): Observable<Pagina<UsuarioAdmin>> {
        let params = new HttpParams().set('pagina', pagina).set('limite', limite);
        if (filtros.nombre) params = params.set('nombre', filtros.nombre);
        if (filtros.apellido) params = params.set('apellido', filtros.apellido);
        if (filtros.rol) params = params.set('rol', filtros.rol);
        if (filtros.id_sede) params = params.set('id_sede', filtros.id_sede);

        return this.http
            .get<ApiResponse<ListadoUsuarios>>(this.url, { params })
            .pipe(map((res) => ({ items: res.datos.usuarios, total: res.datos.total })));
    }

    crear(datos: UsuarioPayload): Observable<string> {
        return this.http
            .post<ApiResponse<{ mensaje: string }>>(this.url, datos)
            .pipe(map((res) => res.datos.mensaje));
    }

    modificar(id: number, datos: UsuarioPayload): Observable<string> {
        return this.http
            .put<ApiResponse<{ mensaje: string }>>(`${this.url}/${id}`, datos)
            .pipe(map((res) => res.datos.mensaje));
    }
}
