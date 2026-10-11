export interface Usuario {
    id: number;
    nombre: string;
    apellido: string;
    dni: string;
    email: string;
    rol: 'administrador' | 'medico' | 'operador' | 'paciente';
    fecha_nacimiento?: string;
    id_cobertura?: number;
    id_sede?: number;
}

export interface Cobertura {
    id: number;
    nombre: string;
    descripcion?: string;
}

export interface ApiResponse<T> {
    codigo: number;
    estado: string;
    datos: T;
}

export interface LoginResponse {
    token: string;
    usuario: Usuario;
}