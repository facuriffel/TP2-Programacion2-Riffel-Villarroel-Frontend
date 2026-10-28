import { Especialidad, Sede } from './admin.models';

export type EstadoTurno = 'confirmado' | 'atendido' | 'cancelado';

export interface AgendaItem {
    id: number;
    fecha: string;
    hora_entrada: string;
    hora_salida: string;
    id_medico: number;
    id_especialidad: number;
    id_sede: number;
    medico_nombre: string;
    medico_apellido: string;
    especialidad: string;
    sede: string;
    turnos_confirmados: number;
}

export interface AgendaPayload {
    fecha: string;
    hora_entrada: string;
    hora_salida: string;
    id_medico: number;
    id_especialidad: number;
    id_sede: number;
}

export interface FiltrosAgenda {
    fecha?: string;
    desde?: string;
    id_sede?: number | null;
    id_medico?: number | null;
}

export interface Turno {
    id: number;
    fecha: string;
    hora: string;
    estado: EstadoTurno;
    nota: string | null;
    id_paciente: number;
    id_agenda: number;
    id_medico: number;
    id_sede: number;
    id_especialidad: number;
    paciente_nombre: string;
    paciente_apellido: string;
    paciente_dni: string;
    paciente_fecha_nacimiento: string | null;
    medico_nombre: string;
    medico_apellido: string;
    sede: string;
    especialidad: string;
}

export interface TurnoPayload {
    id_especialidad: number;
    id_sede: number;
    id_medico: number;
    fecha: string;
    hora: string;
    nota: string;
    id_paciente_body?: number;
}

export interface AtencionPayload {
    diagnostico: string;
    tratamiento: string;
    observaciones: string;
}

export interface RegistroHistorial {
    id: number;
    id_turno: number;
    diagnostico: string;
    tratamiento: string;
    observaciones: string | null;
    fecha: string;
    fecha_turno: string;
    hora_turno: string;
    especialidad: string;
    paciente_nombre?: string;
    paciente_apellido?: string;
    medico_nombre?: string;
    medico_apellido?: string;
}

export interface ActualizarPerfilPayload {
    email: string;
    telefono: string | null;
    id_cobertura: number | null;
    contrasena?: string;
}

export interface PacienteResumen {
    id: number;
    nombre: string;
    apellido: string;
    dni: string;
    email: string;
    id_cobertura: number | null;
}

export interface MedicoResumen {
    id: number;
    nombre: string;
    apellido: string;
    id_sede: number | null;
    sede: string | null;
    especialidades: Especialidad[];
}

export type { Sede, Especialidad };
