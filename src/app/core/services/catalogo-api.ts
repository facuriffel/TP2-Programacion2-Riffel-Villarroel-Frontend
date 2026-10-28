import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/auth.models';

export abstract class CatalogoApi<T extends { id: number }> {
    protected readonly http = inject(HttpClient);
    private readonly url: string;

    protected constructor(ruta: string, private readonly clave: string) {
        this.url = `${environment.apiUrl}/${ruta}`;
    }

    listar(): Observable<T[]> {
        return this.http
            .get<ApiResponse<Record<string, T[]>>>(this.url)
            .pipe(map((res) => res.datos[this.clave] ?? []));
    }

    crear(datos: Omit<T, 'id'>): Observable<string> {
        return this.http
            .post<ApiResponse<{ mensaje: string }>>(this.url, datos)
            .pipe(map((res) => res.datos.mensaje));
    }

    modificar(id: number, datos: Omit<T, 'id'>): Observable<string> {
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
