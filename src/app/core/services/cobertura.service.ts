import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, Cobertura } from '../models/auth.models';

@Injectable({
    providedIn: 'root'
})
export class CoberturaService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/coberturas`;

    listar(): Observable<ApiResponse<{ coberturas: Cobertura[] }>> {
        return this.http.get<ApiResponse<{ coberturas: Cobertura[] }>>(this.apiUrl);
    }
}