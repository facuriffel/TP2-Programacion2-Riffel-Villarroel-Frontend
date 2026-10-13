import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
  ],
  template: `
    <mat-toolbar color="primary" class="app-toolbar">
      <!-- Lado Izquierdo: Menú lateral (si está autenticado) y Branding -->
      <div class="toolbar-left">
        @if (authService.currentUser()) {
          <button
            mat-icon-button
            type="button"
            (click)="toggleMenu.emit()"
            matTooltip="Abrir menú"
            aria-label="Abrir menú de navegación"
            class="menu-button"
          >
            <mat-icon>menu</mat-icon>
          </button>
        }

        <a routerLink="/" class="brand-link" title="Ir al Inicio">
          <mat-icon class="brand-icon">health_and_safety</mat-icon>
          <span class="brand-name">Clínica Virtual</span>
        </a>
      </div>

      <!-- Espaciador Central -->
      <span class="toolbar-spacer"></span>

      <!-- Lado Derecho: Según estado de autenticación -->
      <div class="toolbar-right">
        @if (authService.currentUser(); as user) {
          <!-- Usuario Autenticado -->
          <button
            mat-icon-button
            type="button"
            matTooltip="Semana 3: Próximamente notificaciones"
            aria-label="Notificaciones del sistema"
            class="icon-action-btn"
          >
            <mat-icon>notifications</mat-icon>
          </button>

          <div class="user-info-badge">
            <span class="user-fullname">{{ user.nombre }} {{ user.apellido }}</span>
            <button
              mat-icon-button
              type="button"
              [matTooltip]="'Rol: ' + obtenerTextoRol(user.rol)"
              class="role-indicator-btn"
              [attr.aria-label]="'Rol ' + obtenerTextoRol(user.rol)"
            >
              <mat-icon class="role-icon">{{ obtenerIconoRol(user.rol) }}</mat-icon>
            </button>
          </div>

          <button
            mat-stroked-button
            type="button"
            class="logout-button"
            (click)="onLogout()"
            aria-label="Cerrar sesión"
          >
            <mat-icon>logout</mat-icon>
            <span class="btn-text">Cerrar sesión</span>
          </button>
        } @else {
          <!-- Usuario NO Autenticado -->
          <span class="welcome-text">Bienvenido a la clínica virtual</span>

          <a mat-button routerLink="/login" class="auth-btn">
            <mat-icon>login</mat-icon>
            <span>Ingresar</span>
          </a>

          <a mat-flat-button color="accent" routerLink="/registro" class="auth-btn register-btn">
            <mat-icon>person_add</mat-icon>
            <span>Registrarse</span>
          </a>
        }
      </div>
    </mat-toolbar>
  `,
  styles: [
    `
      .app-toolbar {
        position: sticky;
        top: 0;
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 16px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
        background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
        color: #ffffff;
        min-height: 64px;
      }

      .toolbar-left {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .menu-button {
        color: #ffffff;
      }

      .brand-link {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #ffffff;
        text-decoration: none;
        font-weight: 700;
        letter-spacing: 0.3px;
        transition: opacity 0.2s ease;
      }

      .brand-link:hover {
        opacity: 0.92;
      }

      .brand-icon {
        font-size: 28px;
        width: 28px;
        height: 28px;
        color: #e0f2fe;
      }

      .brand-name {
        font-size: 1.2rem;
        white-space: nowrap;
      }

      .toolbar-spacer {
        flex: 1 1 auto;
      }

      .toolbar-right {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .welcome-text {
        font-size: 0.95rem;
        color: #f0f9ff;
        font-weight: 400;
        margin-right: 8px;
      }

      @media (max-width: 680px) {
        .welcome-text {
          display: none;
        }
        .brand-name {
          font-size: 1rem;
        }
      }

      .auth-btn {
        color: #ffffff;
        border-color: rgba(255, 255, 255, 0.4);
      }

      .auth-btn mat-icon {
        margin-right: 4px;
        font-size: 20px;
        width: 20px;
        height: 20px;
      }

      .register-btn {
        background-color: #ffffff;
        color: #0369a1 !important;
        font-weight: 600;
      }

      .register-btn:hover {
        background-color: #f0f9ff;
      }

      .icon-action-btn {
        color: #ffffff;
      }

      .user-info-badge {
        display: flex;
        align-items: center;
        background: rgba(255, 255, 255, 0.15);
        border: 1px solid rgba(255, 255, 255, 0.25);
        border-radius: 24px;
        padding: 2px 4px 2px 14px;
        gap: 4px;
      }

      .user-fullname {
        font-size: 0.92rem;
        font-weight: 500;
        color: #ffffff;
        white-space: nowrap;
        max-width: 180px;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      @media (max-width: 768px) {
        .user-fullname {
          display: none;
        }
        .user-info-badge {
          padding: 2px;
          background: transparent;
          border: none;
        }
      }

      .role-indicator-btn {
        color: #e0f2fe;
        width: 36px;
        height: 36px;
        line-height: 36px;
      }

      .role-icon {
        font-size: 22px;
        width: 22px;
        height: 22px;
      }

      .logout-button {
        color: #ffffff !important;
        border-color: rgba(255, 255, 255, 0.5) !important;
      }

      .logout-button mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
        margin-right: 4px;
      }

      @media (max-width: 540px) {
        .logout-button .btn-text {
          display: none;
        }
        .logout-button mat-icon {
          margin-right: 0;
        }
        .logout-button {
          min-width: 40px;
          padding: 0 8px;
        }
      }
    `,
  ],
})
export class HeaderComponent {
  readonly authService = inject(AuthService);
  readonly toggleMenu = output<void>();

  onLogout(): void {
    this.authService.logout();
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
