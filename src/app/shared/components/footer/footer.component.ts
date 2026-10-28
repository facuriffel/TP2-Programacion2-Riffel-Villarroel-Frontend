import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../core/services/auth.service';

interface EnlaceFooter {
  etiqueta: string;
  ruta: string;
}

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatButtonModule],
  template: `
    <footer class="app-footer">
      <div class="footer-container">
        <!-- Columna 1: Identidad y Contacto -->
        <div class="footer-col brand-col">
          <div class="footer-brand">
            <mat-icon class="brand-icon">health_and_safety</mat-icon>
            <span class="brand-title">Clínica Virtual</span>
          </div>
          <p class="brand-description">
            Plataforma integral de gestión hospitalaria y atención médica digital, brindando
            servicios de salud confiables y accesibles.
          </p>
        </div>

        <!-- Columna 2: Datos Institucionales y Sedes -->
        <div class="footer-col contact-col">
          <h4 class="col-title">Atención y Sedes</h4>
          <ul class="contact-list">
            <li>
              <mat-icon class="contact-icon">location_on</mat-icon>
              <span>Av. Corrientes 1234, CABA - Sede Central</span>
            </li>
            <li>
              <mat-icon class="contact-icon">phone</mat-icon>
              <span>Urgencias: 0800-222-2546 | Turnos: (011) 4567-8900</span>
            </li>
            <li>
              <mat-icon class="contact-icon">email</mat-icon>
              <span>contacto&#64;clinicavirtual.com.ar</span>
            </li>
          </ul>
        </div>

        <!-- Columna 3: Enlaces Institucionales -->
        <div class="footer-col links-col">
          <h4 class="col-title">Enlaces de Interés</h4>
          <ul class="footer-links">
            @for (enlace of enlaces(); track enlace.ruta) {
              <li>
                <a [routerLink]="enlace.ruta">{{ enlace.etiqueta }}</a>
              </li>
            }
          </ul>
        </div>
      </div>

      <div class="footer-bottom">
        <p class="copyright-text">
          &copy; {{ currentYear }} Clínica Virtual. Todos los derechos reservados. Trabajo Práctico
          Programación 2.
        </p>
      </div>
    </footer>
  `,
  styles: [
    `
      .app-footer {
        background: #ffffff;
        color: #64748b;
        width: 100%;
        max-width: 100%;
        box-sizing: border-box;
        overflow: hidden;
        border-top: 1px solid #e2e8f0;
      }
      .footer-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 28px 24px 20px;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 24px;
        box-sizing: border-box;
        width: 100%;
      }
      .footer-brand {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #0f172a;
        margin-bottom: 8px;
      }
      .brand-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
      .brand-title {
        font-size: 14px;
        font-weight: 600;
      }
      .brand-description {
        font-size: 13px;
        line-height: 1.6;
        margin: 0;
      }
      .col-title {
        color: #0f172a;
        font-size: 11px;
        font-weight: 600;
        margin: 0 0 12px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
      }
      .contact-list,
      .footer-links {
        list-style: none;
        padding: 0;
        margin: 0;
      }
      .contact-list li {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        font-size: 13px;
        line-height: 1.5;
        margin-bottom: 8px;
      }
      .contact-icon {
        color: #94a3b8;
        font-size: 16px;
        width: 16px;
        height: 16px;
        flex-shrink: 0;
        margin-top: 2px;
      }
      .footer-links li {
        margin-bottom: 6px;
      }
      .footer-links a {
        color: #64748b;
        text-decoration: none;
        font-size: 13px;
      }
      .footer-links a:hover {
        color: #0f172a;
      }
      .footer-bottom {
        border-top: 1px solid #f1f5f9;
        padding: 12px 24px;
        text-align: center;
      }
      @media (max-width: 768px) {
        .footer-container {
          grid-template-columns: 1fr;
          text-align: left;
          padding: 20px 16px 16px;
        }
        .footer-bottom {
          padding: 12px 16px;
        }
      }
      .copyright-text {
        font-size: 12px;
        color: #94a3b8;
        margin: 0;
      }
    `,
  ],
})
export class FooterComponent {
  private readonly authService = inject(AuthService);

  readonly currentYear = new Date().getFullYear();

  readonly enlaces = computed<EnlaceFooter[]>(() => {
    const usuario = this.authService.currentUser();
    const inicio = { etiqueta: 'Inicio', ruta: '/' };

    if (!usuario) {
      return [
        inicio,
        { etiqueta: 'Iniciar sesión', ruta: '/login' },
        { etiqueta: 'Registrarse', ruta: '/registro' },
      ];
    }

    switch (usuario.rol) {
      case 'paciente':
        return [
          inicio,
          { etiqueta: 'Solicitar Turno', ruta: '/paciente/nuevo-turno' },
          { etiqueta: 'Mis Turnos', ruta: '/paciente/mis-turnos' },
          { etiqueta: 'Mi Perfil', ruta: '/perfil' },
        ];
      case 'administrador':
        return [
          inicio,
          { etiqueta: 'Reportes', ruta: '/admin/reportes' },
          { etiqueta: 'Gestión de Usuarios', ruta: '/admin/usuarios' },
          { etiqueta: 'Auditoría', ruta: '/admin/auditoria' },
        ];
      case 'medico':
        return [
          inicio,
          { etiqueta: 'Mi Agenda', ruta: '/medico/agenda' },
          { etiqueta: 'Atender Turnos', ruta: '/medico/turnos' },
          { etiqueta: 'Mi Perfil', ruta: '/perfil' },
        ];
      case 'operador':
        return [
          inicio,
          { etiqueta: 'Asignar Turno', ruta: '/operador/turnos' },
          { etiqueta: 'Registrar Paciente', ruta: '/operador/pacientes' },
          { etiqueta: 'Mi Perfil', ruta: '/perfil' },
        ];
      default:
        return [inicio];
    }
  });
}
