import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
  ],
  template: `
    <div class="home-container">
      @if (authService.currentUser(); as user) {
        <!-- ================= VISTA PRIVADA (CON SESIÓN) ================= -->
        <section class="private-view">
          <div class="welcome-banner">
            <div class="welcome-header">
              <span class="role-chip" [attr.data-role]="user.rol">
                <mat-icon class="chip-icon">{{ obtenerIconoRol(user.rol) }}</mat-icon>
                {{ obtenerTextoRol(user.rol) }}
              </span>
              <h1 class="welcome-title">¡Bienvenido/a, {{ user.nombre }} {{ user.apellido }}!</h1>
              <p class="welcome-subtitle">
                Panel principal de Clínica Virtual. Podés navegar por las funcionalidades del sistema
                utilizando los accesos directos o desplegar el menú lateral desde la barra superior.
              </p>
            </div>
          </div>

          <!-- Accesos Rápidos según Rol -->
          <div class="quick-access-section">
            <h2 class="section-title">Accesos Directos</h2>
            <div class="cards-grid">
              <!-- Enlace siempre disponible: Mi Perfil -->
              <mat-card class="action-card" appearance="outlined">
                <mat-card-header>
                  <div class="action-icon-wrapper primary-icon">
                    <mat-icon>account_circle</mat-icon>
                  </div>
                  <mat-card-title>Mi Perfil</mat-card-title>
                  <mat-card-subtitle>Información personal y de cobertura</mat-card-subtitle>
                </mat-card-header>
                <mat-card-content>
                  <p>Consultá tus datos personales, rol asignado, DNI y estado de tu obra social.</p>
                </mat-card-content>
                <mat-card-actions align="end">
                  <a mat-flat-button color="primary" routerLink="/perfil">
                    <span>Ir a Mi Perfil</span>
                    <mat-icon>arrow_forward</mat-icon>
                  </a>
                </mat-card-actions>
              </mat-card>

              <!-- Tarjetas específicas para Paciente -->
              @if (user.rol === 'paciente') {
                <mat-card class="action-card" appearance="outlined">
                  <mat-card-header>
                    <div class="action-icon-wrapper accent-icon">
                      <mat-icon>add_task</mat-icon>
                    </div>
                    <mat-card-title>Solicitar Turno</mat-card-title>
                    <mat-card-subtitle>Reserva de consultas</mat-card-subtitle>
                  </mat-card-header>
                  <mat-card-content>
                    <p>Elegí especialidad, profesional, sede y horario para tu próxima atención.</p>
                  </mat-card-content>
                  <mat-card-actions align="end">
                    <a mat-stroked-button color="primary" routerLink="/en-construccion">
                      <span>Solicitar Turno</span>
                      <mat-icon>arrow_forward</mat-icon>
                    </a>
                  </mat-card-actions>
                </mat-card>

                <mat-card class="action-card" appearance="outlined">
                  <mat-card-header>
                    <div class="action-icon-wrapper info-icon">
                      <mat-icon>event_note</mat-icon>
                    </div>
                    <mat-card-title>Mis Turnos</mat-card-title>
                    <mat-card-subtitle>Historial y próximos turnos</mat-card-subtitle>
                  </mat-card-header>
                  <mat-card-content>
                    <p>Revisá tus turnos confirmados, cancelá o reprogramá tus citas agendadas.</p>
                  </mat-card-content>
                  <mat-card-actions align="end">
                    <a mat-stroked-button color="primary" routerLink="/en-construccion">
                      <span>Ver Mis Turnos</span>
                      <mat-icon>arrow_forward</mat-icon>
                    </a>
                  </mat-card-actions>
                </mat-card>
              }

              <!-- Tarjetas específicas para Médico -->
              @if (user.rol === 'medico') {
                <mat-card class="action-card" appearance="outlined">
                  <mat-card-header>
                    <div class="action-icon-wrapper accent-icon">
                      <mat-icon>calendar_month</mat-icon>
                    </div>
                    <mat-card-title>Mi Agenda</mat-card-title>
                    <mat-card-subtitle>Horarios y disponibilidad</mat-card-subtitle>
                  </mat-card-header>
                  <mat-card-content>
                    <p>Configurá tus días de atención, franjas horarias y bloqueos programados.</p>
                  </mat-card-content>
                  <mat-card-actions align="end">
                    <a mat-stroked-button color="primary" routerLink="/en-construccion">
                      <span>Ver Agenda</span>
                      <mat-icon>arrow_forward</mat-icon>
                    </a>
                  </mat-card-actions>
                </mat-card>

                <mat-card class="action-card" appearance="outlined">
                  <mat-card-header>
                    <div class="action-icon-wrapper info-icon">
                      <mat-icon>event_available</mat-icon>
                    </div>
                    <mat-card-title>Turnos Asignados</mat-card-title>
                    <mat-card-subtitle>Pacientes del día</mat-card-subtitle>
                  </mat-card-header>
                  <mat-card-content>
                    <p>Accedé a la nómina de pacientes citados para hoy y registrá evoluciones.</p>
                  </mat-card-content>
                  <mat-card-actions align="end">
                    <a mat-stroked-button color="primary" routerLink="/en-construccion">
                      <span>Ver Turnos</span>
                      <mat-icon>arrow_forward</mat-icon>
                    </a>
                  </mat-card-actions>
                </mat-card>
              }

              <!-- Tarjetas específicas para Operador -->
              @if (user.rol === 'operador') {
                <mat-card class="action-card" appearance="outlined">
                  <mat-card-header>
                    <div class="action-icon-wrapper accent-icon">
                      <mat-icon>pending_actions</mat-icon>
                    </div>
                    <mat-card-title>Gestión de Turnos</mat-card-title>
                    <mat-card-subtitle>Mesa de entradas</mat-card-subtitle>
                  </mat-card-header>
                  <mat-card-content>
                    <p>Asignación, modificación y confirmación de turnos solicitados telefónicamente.</p>
                  </mat-card-content>
                  <mat-card-actions align="end">
                    <a mat-stroked-button color="primary" routerLink="/en-construccion">
                      <span>Gestionar</span>
                      <mat-icon>arrow_forward</mat-icon>
                    </a>
                  </mat-card-actions>
                </mat-card>

                <mat-card class="action-card" appearance="outlined">
                  <mat-card-header>
                    <div class="action-icon-wrapper info-icon">
                      <mat-icon>how_to_reg</mat-icon>
                    </div>
                    <mat-card-title>Recepción</mat-card-title>
                    <mat-card-subtitle>Llegada de pacientes</mat-card-subtitle>
                  </mat-card-header>
                  <mat-card-content>
                    <p>Confirmá el arribo de pacientes y notificá a los consultorios correspondientes.</p>
                  </mat-card-content>
                  <mat-card-actions align="end">
                    <a mat-stroked-button color="primary" routerLink="/en-construccion">
                      <span>Recepción</span>
                      <mat-icon>arrow_forward</mat-icon>
                    </a>
                  </mat-card-actions>
                </mat-card>
              }

              <!-- Tarjetas específicas para Administrador -->
              @if (user.rol === 'administrador') {
                <mat-card class="action-card" appearance="outlined">
                  <mat-card-header>
                    <div class="action-icon-wrapper accent-icon">
                      <mat-icon>people</mat-icon>
                    </div>
                    <mat-card-title>Usuarios y Sedes</mat-card-title>
                    <mat-card-subtitle>Configuración global</mat-card-subtitle>
                  </mat-card-header>
                  <mat-card-content>
                    <p>Administración de médicos, operadores, pacientes, sedes y especialidades médicas.</p>
                  </mat-card-content>
                  <mat-card-actions align="end">
                    <a mat-stroked-button color="primary" routerLink="/en-construccion">
                      <span>Administrar</span>
                      <mat-icon>arrow_forward</mat-icon>
                    </a>
                  </mat-card-actions>
                </mat-card>

                <mat-card class="action-card" appearance="outlined">
                  <mat-card-header>
                    <div class="action-icon-wrapper info-icon">
                      <mat-icon>bar_chart</mat-icon>
                    </div>
                    <mat-card-title>Reportes y Auditoría</mat-card-title>
                    <mat-card-subtitle>Métricas del sistema</mat-card-subtitle>
                  </mat-card-header>
                  <mat-card-content>
                    <p>Seguimiento de concurrencia, trazabilidad de eventos y auditoría operativa.</p>
                  </mat-card-content>
                  <mat-card-actions align="end">
                    <a mat-stroked-button color="primary" routerLink="/en-construccion">
                      <span>Ver Reportes</span>
                      <mat-icon>arrow_forward</mat-icon>
                    </a>
                  </mat-card-actions>
                </mat-card>
              }
            </div>
          </div>
        </section>
      } @else {
        <!-- ================= VISTA PÚBLICA (SIN SESIÓN) ================= -->
        <section class="public-view">
          <!-- Hero Banner -->
          <div class="hero-banner">
            <div class="hero-content">
              <span class="hero-tag">
                <mat-icon>verified</mat-icon>
                Portal Oficial de Salud Digital
              </span>
              <h1 class="hero-title">
                Cuidamos tu salud de manera ágil, segura y desde donde estés
              </h1>
              <p class="hero-description">
                Bienvenido/a a la Clínica Virtual. Gestioná tus consultas, consultá la cartilla de
                profesionales y accedé a tu historial clínico digital con la mayor calidad médica.
              </p>

              <div class="hero-actions">
                <a mat-flat-button color="primary" routerLink="/login" class="hero-cta-btn">
                  <mat-icon>login</mat-icon>
                  Iniciar Sesión
                </a>
                <a mat-stroked-button color="primary" routerLink="/registro" class="hero-cta-btn-outline">
                  <mat-icon>person_add</mat-icon>
                  Registrarse como Paciente
                </a>
              </div>
            </div>
          </div>

          <!-- Servicios Destacados -->
          <div class="services-section">
            <div class="section-header">
              <h2 class="section-title">Servicios de Nuestra Clínica Virtual</h2>
              <p class="section-subtitle">
                Diseñado para simplificar tu atención médica con herramientas modernas e integradas.
              </p>
            </div>

            <div class="services-grid">
              <mat-card class="service-card" appearance="outlined">
                <mat-card-header>
                  <div class="service-icon-box turnos-icon">
                    <mat-icon>calendar_month</mat-icon>
                  </div>
                  <mat-card-title>Turnos Online 24/7</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <p>
                    Solicitá y gestioná tus turnos médicos en cualquier momento. Disponibilidad en tiempo
                    real con confirmación instantánea por email.
                  </p>
                </mat-card-content>
              </mat-card>

              <mat-card class="service-card" appearance="outlined">
                <mat-card-header>
                  <div class="service-icon-box cartilla-icon">
                    <mat-icon>medical_services</mat-icon>
                  </div>
                  <mat-card-title>Cartilla Especializada</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <p>
                    Profesionales altamente capacitados en diversas especialidades, distribuidos en
                    múltiples sedes para brindarte la mejor cobertura.
                  </p>
                </mat-card-content>
              </mat-card>

              <mat-card class="service-card" appearance="outlined">
                <mat-card-header>
                  <div class="service-icon-box historial-icon">
                    <mat-icon>history_edu</mat-icon>
                  </div>
                  <mat-card-title>Historial Clínico Digital</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <p>
                    Tus diagnósticos, indicaciones y evolución médica centralizados y resguardados con
                    los más estrictos estándares de seguridad y privacidad.
                  </p>
                </mat-card-content>
              </mat-card>
            </div>
          </div>

          <!-- Banner Informativo Inferior -->
          <div class="info-banner">
            <mat-icon class="info-banner-icon">support_agent</mat-icon>
            <div class="info-banner-text">
              <strong>¿Necesitás asistencia inmediata o tenés una urgencia médica?</strong>
              <span>Comunicate las 24 hs con nuestra central de emergencias al 0800-222-2546.</span>
            </div>
          </div>
        </section>
      }
    </div>
  `,
  styles: [
    `
      .home-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 32px 20px 48px;
        box-sizing: border-box;
      }

      /* ====== VISTA PRIVADA ====== */
      .welcome-banner {
        background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
        border: 1px solid #bae6fd;
        border-radius: 16px;
        padding: 32px;
        margin-bottom: 32px;
      }

      .role-chip {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 0.82rem;
        font-weight: 600;
        color: #0369a1;
        background: #ffffff;
        padding: 4px 12px;
        border-radius: 16px;
        border: 1px solid #7dd3fc;
        margin-bottom: 12px;
      }

      .chip-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }

      .welcome-title {
        font-size: 1.85rem;
        font-weight: 700;
        color: #0c4a6e;
        margin: 0 0 8px;
      }

      .welcome-subtitle {
        font-size: 1.05rem;
        color: #334155;
        margin: 0;
        line-height: 1.6;
        max-width: 800px;
      }

      .section-title {
        font-size: 1.35rem;
        font-weight: 600;
        color: #1e293b;
        margin-bottom: 20px;
      }

      .cards-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: 24px;
      }

      .action-card {
        border-radius: 14px;
        padding: 16px;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        background: #ffffff;
      }

      .action-card:hover {
        transform: translateY(-3px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
      }

      .action-icon-wrapper {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 12px;
      }

      .primary-icon {
        background: #e0f2fe;
        color: #0284c7;
      }

      .accent-icon {
        background: #ecfdf5;
        color: #059669;
      }

      .info-icon {
        background: #fef3c7;
        color: #d97706;
      }

      .action-card mat-card-title {
        font-size: 1.15rem;
        font-weight: 600;
        color: #0f172a;
      }

      .action-card mat-card-subtitle {
        font-size: 0.85rem;
        color: #64748b;
      }

      .action-card mat-card-content {
        margin: 16px 0;
        font-size: 0.95rem;
        color: #475569;
        line-height: 1.5;
      }

      .action-card mat-card-actions a mat-icon {
        margin-left: 6px;
        font-size: 18px;
        width: 18px;
        height: 18px;
      }

      /* ====== VISTA PÚBLICA ====== */
      .hero-banner {
        background: linear-gradient(135deg, #0284c7 0%, #075985 100%);
        border-radius: 20px;
        padding: 56px 40px;
        color: #ffffff;
        box-shadow: 0 12px 32px rgba(2, 132, 199, 0.2);
        margin-bottom: 48px;
      }

      @media (max-width: 600px) {
        .hero-banner {
          padding: 36px 20px;
        }
      }

      .hero-content {
        max-width: 820px;
      }

      .hero-tag {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: rgba(255, 255, 255, 0.18);
        border: 1px solid rgba(255, 255, 255, 0.3);
        padding: 6px 14px;
        border-radius: 20px;
        font-size: 0.85rem;
        font-weight: 500;
        margin-bottom: 20px;
        color: #f0f9ff;
      }

      .hero-tag mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }

      .hero-title {
        font-size: 2.35rem;
        font-weight: 800;
        line-height: 1.25;
        margin: 0 0 16px;
        color: #ffffff;
      }

      @media (max-width: 600px) {
        .hero-title {
          font-size: 1.75rem;
        }
      }

      .hero-description {
        font-size: 1.12rem;
        line-height: 1.6;
        color: #e0f2fe;
        margin: 0 0 28px;
      }

      .hero-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 14px;
      }

      .hero-cta-btn {
        background-color: #ffffff !important;
        color: #0369a1 !important;
        font-weight: 600;
        padding: 0 24px;
        height: 48px;
      }

      .hero-cta-btn mat-icon {
        margin-right: 6px;
      }

      .hero-cta-btn-outline {
        border-color: rgba(255, 255, 255, 0.7) !important;
        color: #ffffff !important;
        font-weight: 600;
        padding: 0 24px;
        height: 48px;
      }

      .hero-cta-btn-outline mat-icon {
        margin-right: 6px;
      }

      .services-section {
        margin-bottom: 40px;
      }

      .section-header {
        text-align: center;
        max-width: 680px;
        margin: 0 auto 36px;
      }

      .section-subtitle {
        font-size: 1rem;
        color: #64748b;
        margin: 8px 0 0;
      }

      .services-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 24px;
      }

      .service-card {
        border-radius: 14px;
        padding: 20px;
        background: #ffffff;
      }

      .service-icon-box {
        width: 52px;
        height: 52px;
        border-radius: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 16px;
      }

      .turnos-icon {
        background: #e0f2fe;
        color: #0284c7;
      }

      .cartilla-icon {
        background: #ecfdf5;
        color: #059669;
      }

      .historial-icon {
        background: #fef3c7;
        color: #d97706;
      }

      .service-card mat-card-title {
        font-size: 1.2rem;
        font-weight: 600;
        color: #0f172a;
        margin-bottom: 8px;
      }

      .service-card mat-card-content p {
        font-size: 0.95rem;
        line-height: 1.6;
        color: #475569;
        margin: 0;
      }

      .info-banner {
        display: flex;
        align-items: center;
        gap: 16px;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 14px;
        padding: 20px 24px;
        margin-top: 16px;
      }

      .info-banner-icon {
        color: #0284c7;
        font-size: 32px;
        width: 32px;
        height: 32px;
        flex-shrink: 0;
      }

      .info-banner-text {
        display: flex;
        flex-direction: column;
        gap: 4px;
        font-size: 0.95rem;
        color: #334155;
      }

      .info-banner-text strong {
        color: #0f172a;
      }
    `,
  ],
})
export class HomeComponent {
  readonly authService = inject(AuthService);

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
