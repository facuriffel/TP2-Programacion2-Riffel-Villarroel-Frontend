import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth.service';

interface Acceso {
  titulo: string;
  texto: string;
  icono: string;
  ruta: string;
  tono?: 'ok' | 'warn' | 'info';
}

const PERFIL: Acceso = {
  titulo: 'Mi perfil',
  texto: 'Datos personales, rol asignado, DNI y cobertura.',
  icono: 'account_circle',
  ruta: '/perfil',
};

const ACCESOS_POR_ROL: Record<string, Acceso[]> = {
  paciente: [
    { titulo: 'Solicitar turno', texto: 'Elegí especialidad, sede, médico y horario disponible.', icono: 'add_task', ruta: '/paciente/nuevo-turno', tono: 'ok' },
    { titulo: 'Mis turnos', texto: 'Consultá, cancelá y revisá el detalle de tus turnos.', icono: 'event_note', ruta: '/paciente/mis-turnos', tono: 'info' },
  ],
  medico: [
    { titulo: 'Mi agenda', texto: 'Configurá tus días y franjas horarias de atención.', icono: 'calendar_month', ruta: '/medico/agenda', tono: 'ok' },
    { titulo: 'Turnos asignados', texto: 'Pacientes citados y registro de atención.', icono: 'event_available', ruta: '/medico/turnos', tono: 'warn' },
    { titulo: 'Historial clínico', texto: 'Búsqueda por DNI o apellido de pacientes atendidos.', icono: 'history_edu', ruta: '/medico/historial', tono: 'info' },
  ],
  operador: [
    { titulo: 'Agenda de la sede', texto: 'Carga de agenda de los médicos de tu sede.', icono: 'pending_actions', ruta: '/operador/agenda', tono: 'ok' },
    { titulo: 'Alta de pacientes', texto: 'Registro de pacientes en mesa de entradas.', icono: 'how_to_reg', ruta: '/operador/pacientes', tono: 'info' },
  ],
  administrador: [
    { titulo: 'Usuarios', texto: 'Alta y edición de médicos, operadores y administradores.', icono: 'people', ruta: '/admin/usuarios', tono: 'ok' },
    { titulo: 'Reportes', texto: 'Indicadores de turnos y atención por período.', icono: 'bar_chart', ruta: '/admin/reportes', tono: 'info' },
    { titulo: 'Auditoría', texto: 'Registro de acciones sensibles del sistema.', icono: 'fact_check', ruta: '/admin/auditoria', tono: 'warn' },
  ],
};

const SERVICIOS: Acceso[] = [
  { titulo: 'Turnos online', texto: 'Solicitá y gestioná tus turnos con disponibilidad en tiempo real.', icono: 'calendar_month', ruta: '/registro', tono: 'ok' },
  { titulo: 'Cartilla de profesionales', texto: 'Múltiples especialidades distribuidas en distintas sedes.', icono: 'medical_services', ruta: '/login', tono: 'info' },
  { titulo: 'Historial clínico digital', texto: 'Diagnósticos e indicaciones centralizados y resguardados.', icono: 'history_edu', ruta: '/login', tono: 'warn' },
];

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  readonly authService = inject(AuthService);
  readonly servicios = SERVICIOS;
  readonly accesos = computed(() => {
    const rol = this.authService.currentUser()?.rol ?? '';
    return [PERFIL, ...(ACCESOS_POR_ROL[rol] ?? [])];
  });

  obtenerTextoRol(rol?: string): string {
    const textos: Record<string, string> = {
      administrador: 'Administrador',
      medico: 'Médico',
      operador: 'Operador',
      paciente: 'Paciente',
    };
    return textos[rol ?? ''] ?? 'Usuario';
  }
}
