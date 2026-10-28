import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

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
    MatBadgeModule,
    MatMenuModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <mat-toolbar class="app-toolbar">
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
          <span class="brand-mark"><mat-icon class="brand-icon">health_and_safety</mat-icon></span>
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
            [matMenuTriggerFor]="notifMenu"
            (menuOpened)="notificaciones.refrescar()"
            matTooltip="Notificaciones"
            aria-label="Notificaciones del sistema"
            class="icon-action-btn"
          >
            <mat-icon
              [matBadge]="notificaciones.noLeidas()"
              [matBadgeHidden]="notificaciones.noLeidas() === 0"
              matBadgeColor="warn"
              matBadgeSize="small"
              aria-hidden="false"
              >notifications</mat-icon
            >
          </button>

          <mat-menu #notifMenu="matMenu" xPosition="before" class="notif-menu-panel">
            <div class="notif-panel" (click)="$event.stopPropagation()">
              <div class="notif-title">Notificaciones</div>
              @if (notificaciones.cargando() && notificaciones.notificaciones().length === 0) {
                <div class="notif-empty"><mat-spinner diameter="24"></mat-spinner></div>
              } @else if (notificaciones.notificaciones().length === 0) {
                <div class="notif-empty">No tenés notificaciones.</div>
              } @else {
                @for (n of notificaciones.notificaciones(); track n.id) {
                  <div class="notif-item" [class.unread]="!n.leida">
                    <div class="notif-body">
                      <div class="notif-msg">{{ n.mensaje }}</div>
                      <div class="notif-date">{{ n.fecha | date: 'dd/MM/yyyy HH:mm' }}</div>
                    </div>
                    @if (!n.leida) {
                      <button
                        mat-icon-button
                        type="button"
                        matTooltip="Marcar como leída"
                        aria-label="Marcar como leída"
                        (click)="notificaciones.marcarLeida(n.id)"
                      >
                        <mat-icon>done</mat-icon>
                      </button>
                    }
                  </div>
                }
              }
            </div>
          </mat-menu>

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

          <a mat-flat-button routerLink="/registro" class="auth-btn register-btn">
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
        height: 56px;
        padding: 0 20px;
        background: rgba(255, 255, 255, 0.8);
        backdrop-filter: blur(12px);
        border-bottom: 1px solid #e2e8f0;
        color: #0f172a;
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        max-width: 100%;
        box-sizing: border-box;
        overflow: hidden;
      }
      .toolbar-left,
      .toolbar-right {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .toolbar-left {
        min-width: 0;
      }
      .toolbar-right {
        flex-shrink: 0;
      }
      .menu-button,
      .icon-action-btn {
        flex-shrink: 0;
      }
      .brand-link {
        min-width: 0;
      }
      .toolbar-spacer {
        flex: 1 1 auto;
      }
      .brand-link {
        display: flex;
        align-items: center;
        gap: 10px;
        color: #0f172a;
        text-decoration: none;
      }
      .brand-mark {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        border-radius: 8px;
        background: #0f172a;
      }
      .brand-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        color: #ffffff;
      }
      .brand-name {
        font-size: 15px;
        font-weight: 600;
        letter-spacing: -0.01em;
        white-space: nowrap;
      }
      .welcome-text {
        font-size: 13px;
        color: #64748b;
        margin-right: 4px;
      }
      .auth-btn mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }
      .bell-icon {
        color: #475569;
      }
      .user-info-badge {
        display: flex;
        align-items: center;
        gap: 2px;
        padding: 0 4px 0 12px;
        border: 1px solid #e2e8f0;
        border-radius: 999px;
        background: #ffffff;
      }
      .user-fullname {
        font-size: 13px;
        font-weight: 500;
        white-space: nowrap;
        max-width: 200px;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .role-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        color: #64748b;
      }
      @media (max-width: 768px) {
        .app-toolbar {
          padding: 0 8px;
        }
        .toolbar-left,
        .toolbar-right {
          gap: 8px;
        }
        .brand-name {
          font-size: 13px;
        }
        .welcome-text {
          display: none;
        }
        .logout-button {
          min-width: 0;
          padding: 0 8px;
        }
        .logout-button .btn-text,
        .auth-btn span {
          display: none;
        }
        .logout-button mat-icon,
        .auth-btn mat-icon {
          margin: 0;
        }
        .auth-btn {
          min-width: 0;
          padding: 0 8px;
        }
      }
      @media (max-width: 600px) {
        .brand-name,
        .user-fullname {
          display: none;
        }
        .user-info-badge {
          padding: 0 4px;
        }
      }
      ::ng-deep .notif-menu-panel {
        max-width: min(420px, 95vw) !important;
      }
      .notif-panel {
        width: min(380px, 95vw);
        max-height: 420px;
        overflow-x: hidden;
        overflow-y: auto;
        box-sizing: border-box;
      }
      .notif-title {
        padding: 12px 16px;
        font-size: 13px;
        font-weight: 600;
        border-bottom: 1px solid #e2e8f0;
      }
      .notif-empty {
        display: flex;
        justify-content: center;
        padding: 24px 16px;
        font-size: 13px;
        color: #64748b;
      }
      .notif-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 8px 8px 16px;
        border-bottom: 1px solid #f1f5f9;
        font-size: 13px;
        color: #64748b;
      }
      .notif-item.unread {
        background: #f8fafc;
        border-left: 3px solid #0f172a;
        color: #0f172a;
        font-weight: 500;
      }
      .notif-body {
        flex: 1;
        min-width: 0;
        overflow-wrap: anywhere;
      }
      .notif-date {
        font-size: 11px;
        color: #94a3b8;
        font-weight: 400;
      }
    `,
  ],
})
export class HeaderComponent {
  readonly authService = inject(AuthService);
  readonly notificaciones = inject(NotificationService);
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
