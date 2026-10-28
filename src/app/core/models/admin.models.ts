import { Cobertura, Usuario } from './auth.models';

export type { Cobertura };

export interface Sede {
    id: number;
    nombre: string;
    direccion: string;
    telefono: string;
}

export interface Especialidad {
    id: number;
    descripcion: string;
}

export type RolUsuario = Usuario['rol'];

export interface UsuarioAdmin {
    id: number;
    nombre: string;
    apellido: string;
    dni: string;
    fecha_nacimiento: string | null;
    email: string;
    rol: RolUsuario;
    id_cobertura: number | null;
    id_sede: number | null;
    sede: string | null;
    especialidades: Especialidad[];
}

export interface UsuarioPayload {
    nombre: string;
    apellido: string;
    dni: string;
    fecha_nacimiento: string | null;
    email: string;
    password?: string;
    rol: RolUsuario;
    id_cobertura: number | null;
    id_sede: number | null;
    especialidades: number[];
}

export interface FiltrosUsuarios {
    nombre: string;
    apellido: string;
    rol: string;
    id_sede: number | null;
}

export interface Pagina<T> {
    items: T[];
    total: number;
}

export interface LogAuditoria {
    id: number;
    id_usuario: number;
    nombre: string;
    apellido: string;
    email: string;
    accion: 'ALTA' | 'BAJA' | 'MODIFICACION';
    entidad: string;
    detalle: string;
    fecha: string;
}

export interface FiltrosAuditoria {
    usuario: string;
    entidad: string;
    desde: string | null;
    hasta: string | null;
}

export interface TurnosPorEspecialidad {
    id_especialidad: number;
    descripcion: string;
    cantidad_turnos: number;
}

export interface TurnosPorSede {
    id_sede: number;
    nombre: string;
    cantidad_turnos: number;
}

export interface RankingMedico {
    id_medico: number;
    nombre: string;
    apellido: string;
    cantidad_turnos: number;
}

export interface TasaCancelacion {
    total_turnos: number;
    turnos_cancelados: number;
    tasa_cancelacion: number;
}

export interface RangoFechas {
    desde: string | null;
    hasta: string | null;
}
