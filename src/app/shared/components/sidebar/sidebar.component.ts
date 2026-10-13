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
      <!-- Encabezado de Usuario dentro del Menú Lateral -->
      @if (authService.currentUser(); as user) {
        <div class="user-profile-header">
          <div class="avatar-circle">
            {{ obtenerIniciales(user.nombre, user.apellido) }}
          </div>
          <div class="user-details">
            <h3 class="user-name">{{ user.nombre }} {{ user.apellido }}</h3>
            <span class="role-badge" [attr.data-role]="user.rol">
              <mat-icon class="badge-icon">{{ obtenerIconoRol(user.rol) }}</mat-icon>
              {{ obtenerTextoRol(user.rol) }}
            </span>
          </div>
        </div>
        <mat-divider></mat-divider>
      }

      <!-- Lista de Navegación -->
      <mat-nav-list class="nav-list">
        <!-- Sección Común -->
        <div class="section-label">General</div>

        <a
          mat-list-item
          routerLink="/"
          routerLinkActive="active-link"
          [routerLinkActiveOptions]="{ exact: true }"
          (click)="onItemClick()"
        >
          <mat-icon matListItemIcon>home</mat-icon>
          <span matListItemTitle>Inicio</span>
        </a>

        <a
          mat-list-item
          routerLink="/perfil"
          routerLinkActive="active-link"
          (click)="onItemClick()"
        >
          <mat-icon matListItemIcon>account_circle</mat-icon>
          <span matListItemTitle>Mi Perfil</span>
        </a>

        <!-- Opciones Específicas por Rol -->
        @if (authService.currentUser(); as user) {
          @if (user.rol === 'administrador') {
            <mat-divider></mat-divider>
            <div class="section-label">Administración</div>

            <a mat-list-item routerLink="/en-construccion" (click)="onItemClick()">
              <mat-icon matListItemIcon>people</mat-icon>
              <span matListItemTitle>Gestión de Usuarios</span>
            </a>

            <a mat-list-item routerLink="/en-construccion" (click)="onItemClick()">
              <mat-icon matListItemIcon>location_city</mat-icon>
              <span matListItemTitle>Sedes</span>
            </a>

            <a mat-list-item routerLink="/en-construccion" (click)="onItemClick()">
              <mat-icon matListItemIcon>medical_information</mat-icon>
              <span matListItemTitle>Especialidades</span>
            </a>

            <a mat-list-item routerLink="/en-construccion" (click)="onItemClick()">
              <mat-icon matListItemIcon>bar_chart</mat-icon>
              <span matListItemTitle>Reportes</span>
            </a>

            <a mat-list-item routerLink="/en-construccion" (click)="onItemClick()">
              <mat-icon matListItemIcon>policy</mat-icon>
              <span matListItemTitle>Auditoría</span>
            </a>
          }

          @if (user.rol === 'medico') {
            <mat-divider></mat-divider>
            <div class="section-label">Atención Médica</div>

            <a mat-list-item routerLink="/en-construccion" (click)="onItemClick()">
              <mat-icon matListItemIcon>calendar_month</mat-icon>
              <span matListItemTitle>Mi Agenda</span>
            </a>

            <a mat-list-item routerLink="/en-construccion" (click)="onItemClick()">
              <mat-icon matListItemIcon>event_available</mat-icon>
              <span matListItemTitle>Turnos Asignados</span>
            </a>

            <a mat-list-item routerLink="/en-construccion" (click)="onItemClick()">
              <mat-icon matListItemIcon>folder_shared</mat-icon>
              <span matListItemTitle>Historial Clínico</span>
            </a>
          }

          @if (user.rol === 'operador') {
            <mat-divider></mat-divider>
            <div class="section-label">Gestión Operativa</div>

            <a mat-list-item routerLink="/en-construccion" (click)="onItemClick()">
              <mat-icon matListItemIcon>pending_actions</mat-icon>
              <span matListItemTitle>Gestión de Turnos</span>
            </a>

            <a mat-list-item routerLink="/en-construccion" (click)="onItemClick()">
              <mat-icon matListItemIcon>how_to_reg</mat-icon>
              <span matListItemTitle>Recepción de Pacientes</span>
            </a>
          }

          @if (user.rol === 'paciente') {
            <mat-divider></mat-divider>
            <div class="section-label">Portal de Salud</div>

            <a mat-list-item routerLink="/en-construccion" (click)="onItemClick()">
              <mat-icon matListItemIcon>add_task</mat-icon>
              <span matListItemTitle>Solicitar Turno</span>
            </a>

            <a mat-list-item routerLink="/en-construccion" (click)="onItemClick()">
              <mat-icon matListItemIcon>event_note</mat-icon>
              <span matListItemTitle>Mis Turnos</span>
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
        background-color: #ffffff;
        box-sizing: border-box;
      }

      .user-profile-header {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 20px 16px;
        background: #f8fafc;
      }

      .avatar-circle {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
        color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 1.1rem;
        box-shadow: 0 2px 6px rgba(2, 132, 199, 0.25);
        flex-shrink: 0;
      }

      .user-details {
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }

      .user-name {
        margin: 0;
        font-size: 0.95rem;
        font-weight: 600;
        color: #1e293b;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .role-badge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 0.78rem;
        font-weight: 600;
        color: #0369a1;
        background: #e0f2fe;
        padding: 2px 8px;
        border-radius: 12px;
        margin-top: 4px;
        width: fit-content;
      }

      .badge-icon {
        font-size: 14px;
        width: 14px;
        height: 14px;
      }

      .section-label {
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #94a3b8;
        padding: 14px 16px 6px;
      }

      .nav-list {
        flex: 1;
        overflow-y: auto;
        padding-top: 4px;
      }

      .nav-list a {
        border-radius: 8px;
        margin: 2px 8px;
        color: #334155;
        transition: background-color 0.15s ease;
      }

      .nav-list a:hover {
        background-color: #f1f5f9;
      }

      .active-link {
        background-color: #e0f2fe !important;
        color: #0369a1 !important;
        font-weight: 600;
      }

      .active-link mat-icon {
        color: #0284c7 !important;
      }

      .sidebar-footer {
        padding: 12px 16px 16px;
        background: #ffffff;
      }

      .logout-btn {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        gap: 8px;
        color: #dc2626 !important;
        border-radius: 8px;
        padding: 8px 12px;
      }

      .logout-btn:hover {
        background-color: #fef2f2 !important;
      }
    `,
  ],
})
export class SidebarComponent {
  readonly authService = inject(AuthService);
  readonly closeDrawer = output<void>();

  onItemClick(): void {
    this.closeDrawer.emit();
  }

  onLogout(): void {
    this.closeDrawer.emit();
    this.authService.logout();
  }

  obtenerIniciales(nombre?: string, apellido?: string): string {
    const n = nombre ? nombre.trim().charAt(0).toUpperCase() : '';
    const a = apellido ? apellido.trim().charAt(0).toUpperCase() : '';
    return `${n}${a}` || 'CV';
  }

  obtenerIconoRol(rol?: string): string {
    switch (rol) {
      case 'administrador':
        return 'admin_panel_settings';
      case 'medico':
        return 'medical_services';
      case 'operador':
        return 'support_agent';
      case 'paciente':
        return 'person';
      default:
        return 'badge';
    }
  }

  obtenerTextoRol(rol?: string): string {
    switch (rol) {
      case 'administrador':
        return 'Administrador';
      case 'medico':
        return 'Médico';
      case 'operador':
        return 'Operador';
      case 'paciente':
        return 'Paciente';
      default:
        return 'Usuario';
    }
  }
}
