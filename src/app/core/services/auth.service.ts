import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, switchMap, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, Usuario } from '../models/auth.models';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private http = inject(HttpClient);
    private router = inject(Router);
    private apiUrl = `${environment.apiUrl}/auth`;

    currentUser = signal<Usuario | null>(this.obtenerUsuarioAlmacenado());

    login(credenciales: { dni: string; password: string }): Observable<ApiResponse<{ usuario: Usuario }>> {
        // Tu backend espera 'contrasena'
        const payload = {
            dni: credenciales.dni,
            contrasena: credenciales.password
        };

        return this.http.post<ApiResponse<{ token: string }>>(`${this.apiUrl}/login`, payload).pipe(
            tap(res => {
                if (res.datos?.token) {
                    localStorage.setItem('tp2_token', res.datos.token);
                }
            }),
            // Con el token guardado, traemos los datos del perfil (nombre, apellido, rol, etc.)
            switchMap(() => this.getPerfil()),
            tap(resPerfil => {
                if (resPerfil.datos?.usuario) {
                    localStorage.setItem('tp2_usuario', JSON.stringify(resPerfil.datos.usuario));
                    this.currentUser.set(resPerfil.datos.usuario);
                }
            })
        );
    }

    registro(datosPaciente: any): Observable<ApiResponse<any>> {
        // Mapeamos a 'contrasena' para cumplir con lo que espera el controlador
        const payload = {
            ...datosPaciente,
            contrasena: datosPaciente.password
        };
        return this.http.post<ApiResponse<any>>(`${this.apiUrl}/registro`, payload);
    }

    getPerfil(): Observable<ApiResponse<{ usuario: Usuario }>> {
        return this.http.get<ApiResponse<{ usuario: Usuario }>>(`${this.apiUrl}/perfil`);
    }

    logout(): void {
        localStorage.removeItem('tp2_token');
        localStorage.removeItem('tp2_usuario');
        this.currentUser.set(null);
        this.router.navigate(['/login']);
    }

    getToken(): string | null {
        return localStorage.getItem('tp2_token');
    }

    isLoggedIn(): boolean {
        return !!this.getToken();
    }

    private obtenerUsuarioAlmacenado(): Usuario | null {
        const usuarioJson = localStorage.getItem('tp2_usuario');
        return usuarioJson ? JSON.parse(usuarioJson) : null;
    }
}