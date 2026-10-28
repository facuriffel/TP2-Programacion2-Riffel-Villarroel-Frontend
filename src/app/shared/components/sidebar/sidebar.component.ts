import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatListModule,
    MatIconModule,
    MatDividerModule,
    MatButtonModule,
    MatChipsModule,
  ],
  template: `
    <aside class="sidebar-wrapper">
      <!-- Lista de Navegación -->
      <mat-nav-list class="nav-list" (click)="onNavClick($event)">
        <!-- Sección Común -->
        <div class="section-label">General</div>

        <a
          mat-list-item
          routerLink="/"
          routerLinkActive="active-link"
          [routerLinkActiveOptions]="{ exact: true }"
         
        >
          <mat-icon matListItemIcon>home</mat-icon>
          <span matListItemTitle>Inicio</span>
        </a>

        <a
          mat-list-item
          routerLink="/perfil"
          routerLinkActive="active-link"
         
        >
          <mat-icon matListItemIcon>account_circle</mat-icon>
          <span matListItemTitle>Mi Perfil</span>
        </a>

        <!-- Opciones Específicas por Rol -->
        @if (authService.currentUser(); as user) {
          @if (user.rol === 'administrador') {
            <div class="section-label">Administración</div>

            <a mat-list-item routerLink="/admin/reportes" routerLinkActive="active-link">
              <mat-icon matListItemIcon>bar_chart</mat-icon>
              <span matListItemTitle>Reportes</span>
            </a>

            <a mat-list-item routerLink="/admin/usuarios" routerLinkActive="active-link">
              <mat-icon matListItemIcon>people</mat-icon>
              <span matListItemTitle>Gestión de Usuarios</span>
            </a>

            <a mat-list-item routerLink="/admin/sedes" routerLinkActive="active-link">
              <mat-icon matListItemIcon>location_city</mat-icon>
              <span matListItemTitle>Sedes</span>
            </a>

            <a mat-list-item routerLink="/admin/especialidades" routerLinkActive="active-link">
              <mat-icon matListItemIcon>medical_information</mat-icon>
              <span matListItemTitle>Especialidades</span>
            </a>

            <a mat-list-item routerLink="/admin/coberturas" routerLinkActive="active-link">
              <mat-icon matListItemIcon>health_and_safety</mat-icon>
              <span matListItemTitle>Coberturas</span>
            </a>

            <a mat-list-item routerLink="/admin/auditoria" routerLinkActive="active-link">
              <mat-icon matListItemIcon>policy</mat-icon>
              <span matListItemTitle>Auditoría</span>
            </a>
          }

          @if (user.rol === 'medico') {
            <div class="section-label">Atención Médica</div>

            <a mat-list-item routerLink="/medico/agenda" routerLinkActive="active-link">
              <mat-icon matListItemIcon>calendar_month</mat-icon>
              <span matListItemTitle>Mi Agenda</span>
            </a>

            <a mat-list-item routerLink="/medico/turnos" routerLinkActive="active-link">
              <mat-icon matListItemIcon>event_available</mat-icon>
              <span matListItemTitle>Turnos Programados</span>
            </a>

            <a mat-list-item routerLink="/medico/historial" routerLinkActive="active-link">
              <mat-icon matListItemIcon>folder_shared</mat-icon>
              <span matListItemTitle>Historial Clínico</span>
            </a>
          }

          @if (user.rol === 'operador') {
            <div class="section-label">Gestión Operativa</div>

            <a mat-list-item routerLink="/operador/agenda" routerLinkActive="active-link">
              <mat-icon matListItemIcon>calendar_month</mat-icon>
              <span matListItemTitle>Agenda de Médicos</span>
            </a>

            <a mat-list-item routerLink="/operador/turnos" routerLinkActive="active-link">
              <mat-icon matListItemIcon>pending_actions</mat-icon>
              <span matListItemTitle>Turnos de la Sede</span>
            </a>

            <a mat-list-item routerLink="/operador/asignar-turno" routerLinkActive="active-link">
              <mat-icon matListItemIcon>add_task</mat-icon>
              <span matListItemTitle>Asignar Turno</span>
            </a>

            <a mat-list-item routerLink="/operador/pacientes" routerLinkActive="active-link">
              <mat-icon matListItemIcon>how_to_reg</mat-icon>
              <span matListItemTitle>Alta de Pacientes</span>
            </a>
          }

          @if (user.rol === 'paciente') {
            <div class="section-label">Portal de Salud</div>

            <a mat-list-item routerLink="/paciente/nuevo-turno" routerLinkActive="active-link">
              <mat-icon matListItemIcon>add_task</mat-icon>
              <span matListItemTitle>Solicitar Turno</span>
            </a>

            <a mat-list-item routerLink="/paciente/mis-turnos" routerLinkActive="active-link">
              <mat-icon matListItemIcon>event_note</mat-icon>
              <span matListItemTitle>Mis Turnos</span>
            </a>

            <a mat-list-item routerLink="/paciente/datos" routerLinkActive="active-link">
              <mat-icon matListItemIcon>manage_accounts</mat-icon>
              <span matListItemTitle>Mis Datos Personales</span>
            </a>
          }
        }
      </mat-nav-list>

      <!-- Pie del Sidebar: Cerrar Sesión -->
      <div class="sidebar-footer">
        <mat-divider></mat-divider>
        <button mat-button class="logout-btn" (click)="onLogout()">
          <mat-icon>logout</mat-icon>
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  `,
  styles: [
    `
      .sidebar-wrapper {
        display: flex;
        flex-direction: column;
        height: 100%;
        background: #ffffff;
      }
      .section-label {
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: #94a3b8;
        padding: 18px 20px 6px;
      }
      .nav-list {
        flex: 1;
        overflow-y: auto;
        padding: 0 8px;
      }
      .nav-list a {
        position: relative;
        border-radius: 8px;
        margin: 1px 0;
        height: 38px;
        font-size: 13px;
        color: #475569;
        transition: background-color 0.12s ease;
      }
      .nav-list a .mdc-list-item__content,
      .nav-list a .mat-mdc-list-item-unscoped-content {
        overflow: visible;
        text-overflow: clip;
        white-space: normal;
        line-height: 1.2;
      }
      .nav-list a {
        --mat-list-list-item-leading-icon-start-space: 12px;
        --mat-list-list-item-leading-icon-end-space: 12px;
      }
      .nav-list a:hover {
        background: #f1f5f9;
      }
      .nav-list a.active-link {
        background: #f1f5f9;
        color: #0f172a;
        font-weight: 600;
      }
      .nav-list a.active-link::before {
        content: '';
        position: absolute;
        left: 0;
        top: 9px;
        bottom: 9px;
        width: 3px;
        border-radius: 0 3px 3px 0;
        background: #0f172a;
      }
      .sidebar-footer {
        padding: 8px 12px 12px;
      }
      .logout-btn {
        width: 100%;
        justify-content: flex-start;
        color: #475569;
      }
    `,
  ],
})
export class SidebarComponent {
  readonly authService = inject(AuthService);
  readonly navegar = output<void>();

  onNavClick(event: Event): void {
    if ((event.target as HTMLElement).closest('a[mat-list-item]')) this.navegar.emit();
  }

  onLogout(): void {
    this.navegar.emit();
    this.authService.logout();
  }
}
