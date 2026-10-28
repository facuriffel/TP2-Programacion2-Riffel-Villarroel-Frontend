import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { AuthService } from '../../core/services/auth.service';
import { CoberturaService } from '../../core/services/cobertura.service';
import { Usuario } from '../../core/models/auth.models';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatChipsModule,
  ],
  template: `
    <div class="perfil-container">
      @if (cargando()) {
        <!-- Estado de Carga: Spinner Centrado -->
        <div class="loading-state">
          <mat-spinner diameter="52" color="primary"></mat-spinner>
          <p class="loading-text">Cargando datos del perfil...</p>
        </div>
      } @else if (error()) {
        <!-- Estado de Error -->
        <mat-card class="error-card" appearance="outlined">
          <mat-card-header>
            <div class="error-icon-box">
              <mat-icon>error_outline</mat-icon>
            </div>
            <mat-card-title>No pudimos cargar tu perfil</mat-card-title>
            <mat-card-subtitle>{{ error() }}</mat-card-subtitle>
          </mat-card-header>
          <mat-card-actions align="end">
            <button mat-flat-button color="primary" (click)="cargarPerfil()">
              <mat-icon>refresh</mat-icon>
              Reintentar
            </button>
            <a mat-stroked-button routerLink="/">
              <mat-icon>home</mat-icon>
              Volver al Inicio
            </a>
          </mat-card-actions>
        </mat-card>
      } @else if (perfil(); as usuario) {
        <!-- Estado Exitoso: Tarjeta de Perfil -->
        <mat-card class="perfil-card" appearance="outlined">
          <mat-card-header class="perfil-header">
            <div class="avatar-large">
              {{ obtenerIniciales(usuario.nombre, usuario.apellido) }}
            </div>
            <div class="header-titles">
              <mat-card-title>{{ usuario.nombre }} {{ usuario.apellido }}</mat-card-title>
              <mat-card-subtitle>Información Personal y Cobertura Médica</mat-card-subtitle>
            </div>
            <span class="role-chip" [attr.data-role]="usuario.rol">
              <mat-icon class="role-icon">{{ obtenerIconoRol(usuario.rol) }}</mat-icon>
              {{ obtenerTextoRol(usuario.rol) }}
            </span>
          </mat-card-header>

          <mat-divider></mat-divider>

          <mat-card-content class="perfil-content">
            <h3 class="section-title">Datos Personales</h3>
            <div class="data-grid">
              <div class="data-item">
                <div class="item-icon-wrapper">
                  <mat-icon>badge</mat-icon>
                </div>
                <div class="item-info">
                  <span class="item-label">Nombre y Apellido</span>
                  <span class="item-value">{{ usuario.nombre }} {{ usuario.apellido }}</span>
                </div>
              </div>

              <div class="data-item">
                <div class="item-icon-wrapper">
                  <mat-icon>fingerprint</mat-icon>
                </div>
                <div class="item-info">
                  <span class="item-label">Documento Nacional de Identidad (DNI)</span>
                  <span class="item-value">{{ usuario.dni }}</span>
                </div>
              </div>

              <div class="data-item">
                <div class="item-icon-wrapper">
                  <mat-icon>email</mat-icon>
                </div>
                <div class="item-info">
                  <span class="item-label">Correo Electrónico</span>
                  <span class="item-value">{{ usuario.email }}</span>
                </div>
              </div>

              <div class="data-item">
                <div class="item-icon-wrapper">
                  <mat-icon>calendar_today</mat-icon>
                </div>
                <div class="item-info">
                  <span class="item-label">Fecha de Nacimiento</span>
                  <span class="item-value">
                    {{ formatearFecha(usuario.fecha_nacimiento) }}
                  </span>
                </div>
              </div>

              <div class="data-item">
                <div class="item-icon-wrapper">
                  <mat-icon>verified_user</mat-icon>
                </div>
                <div class="item-info">
                  <span class="item-label">Rol Asignado</span>
                  <span class="item-value role-text">{{ obtenerTextoRol(usuario.rol) }}</span>
                </div>
              </div>

              <div class="data-item">
                <div class="item-icon-wrapper medical-icon">
                  <mat-icon>health_and_safety</mat-icon>
                </div>
                <div class="item-info">
                  <span class="item-label">Cobertura / Obra Social</span>
                  <span class="item-value highlight-value">
                    {{ coberturaNombre() }}
                  </span>
                </div>
              </div>
            </div>
          </mat-card-content>

          <mat-divider></mat-divider>

          <mat-card-actions class="perfil-actions" align="end">
            <button mat-button color="primary" (click)="cargarPerfil()">
              <mat-icon>refresh</mat-icon>
              Actualizar Datos
            </button>
            <a mat-flat-button color="primary" routerLink="/">
              <mat-icon>home</mat-icon>
              Volver al Inicio
            </a>
          </mat-card-actions>
        </mat-card>
      }
    </div>
  `,
  styles: [
    `
      .perfil-container {
        max-width: 860px;
        margin: 0 auto;
        padding: 36px 16px;
        box-sizing: border-box;
      }

      /* Loading State */
      .loading-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 360px;
        gap: 16px;
      }

      .loading-text {
        font-size: 1rem;
        color: #475569;
        font-weight: 500;
        margin: 0;
      }

      /* Error Card */
      .error-card {
        border-radius: 16px;
        padding: 24px;
        border-top: 4px solid #dc2626;
        background: #ffffff;
      }

      .error-icon-box {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: #fef2f2;
        color: #dc2626;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 16px;
      }

      /* Perfil Card */
      .perfil-card {
        border-radius: 16px;
        background: #ffffff;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
        overflow: hidden;
      }

      .perfil-header {
        display: flex;
        align-items: center;
        padding: 28px 24px 20px;
        gap: 20px;
        position: relative;
      }

      @media (max-width: 600px) {
        .perfil-header {
          flex-direction: column;
          align-items: flex-start;
          gap: 12px;
        }
      }

      .avatar-large {
        width: 68px;
        height: 68px;
        border-radius: 50%;
        background: linear-gradient(135deg, #0f172a 0%, #0f172a 100%);
        color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.6rem;
        font-weight: 700;
        box-shadow: 0 4px 12px rgba(2, 132, 199, 0.25);
        flex-shrink: 0;
      }

      .header-titles {
        flex: 1;
      }

      .perfil-header mat-card-title {
        font-size: 1.5rem;
        font-weight: 700;
        color: #0f172a;
        margin: 0 0 4px;
      }

      .perfil-header mat-card-subtitle {
        font-size: 0.95rem;
        color: #64748b;
        margin: 0;
      }

      .role-chip {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 0.85rem;
        font-weight: 600;
        color: #0f172a;
        background: #f1f5f9;
        border: 1px solid #e2e8f0;
        padding: 6px 14px;
        border-radius: 20px;
      }

      .role-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }

      .perfil-content {
        padding: 24px;
      }

      .section-title {
        font-size: 1.1rem;
        font-weight: 600;
        color: #1e293b;
        margin: 0 0 20px;
      }

      .data-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 20px;
      }

      .data-item {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 14px 16px;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        transition: background-color 0.15s ease;
      }

      .data-item:hover {
        background: #f1f5f9;
      }

      .item-icon-wrapper {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        background: #e2e8f0;
        color: #475569;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .item-icon-wrapper mat-icon {
        font-size: 22px;
        width: 22px;
        height: 22px;
      }

      .medical-icon {
        background: #ecfdf5;
        color: #059669;
      }

      .item-info {
        display: flex;
        flex-direction: column;
        gap: 2px;
        overflow: hidden;
      }

      .item-label {
        font-size: 0.78rem;
        color: #64748b;
        text-transform: uppercase;
        font-weight: 600;
        letter-spacing: 0.03em;
      }

      .item-value {
        font-size: 0.98rem;
        color: #1e293b;
        font-weight: 500;
        word-break: break-word;
      }

      .highlight-value {
        color: #047857;
        font-weight: 600;
      }

      .role-text {
        color: #0f172a;
        font-weight: 600;
      }

      .perfil-actions {
        padding: 16px 24px;
        background: #f8fafc;
      }

      .perfil-actions mat-icon {
        margin-right: 6px;
      }
    `,
  ],
})
export class PerfilComponent implements OnInit {
  private authService = inject(AuthService);
  private coberturaService = inject(CoberturaService);

  cargando = signal(true);
  error = signal<string | null>(null);
  perfil = signal<Usuario | null>(null);
  coberturaNombre = signal<string>('Sin cobertura informada');

  ngOnInit(): void {
    this.cargarPerfil();
  }

  cargarPerfil(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.authService.getPerfil().subscribe({
      next: (res) => {
        const usuario = res.datos?.usuario;
        if (usuario) {
          this.perfil.set(usuario);
          // Mantenemos sincronizado el estado global del usuario
          this.authService.currentUser.set(usuario);

          // Si el usuario tiene id_cobertura, resolvemos el nombre de la misma
          if (usuario.id_cobertura) {
            this.resolverNombreCobertura(usuario.id_cobertura);
          } else {
            this.coberturaNombre.set('Particular / Sin Obra Social');
            this.cargando.set(false);
          }
        } else {
          this.error.set('No se encontraron los datos del perfil.');
          this.cargando.set(false);
        }
      },
      error: (err) => {
        // En caso de falla, si ya teníamos el usuario en memoria lo mostramos
        const usuarioAlmacenado = this.authService.currentUser();
        if (usuarioAlmacenado) {
          this.perfil.set(usuarioAlmacenado);
          if (usuarioAlmacenado.id_cobertura) {
            this.resolverNombreCobertura(usuarioAlmacenado.id_cobertura);
          } else {
            this.coberturaNombre.set('Particular / Sin Obra Social');
            this.cargando.set(false);
          }
        } else {
          const mensaje =
            err.error?.datos?.mensaje ||
            'Error al conectar con el servidor para obtener los datos del perfil.';
          this.error.set(mensaje);
          this.cargando.set(false);
        }
      },
    });
  }

  private resolverNombreCobertura(idCobertura: number): void {
    this.coberturaService.listar().subscribe({
      next: (lista) => {
        const encontrada = lista.find((c) => c.id === idCobertura);
        if (encontrada) {
          this.coberturaNombre.set(encontrada.nombre);
        } else {
          this.coberturaNombre.set(`Cobertura ID: ${idCobertura}`);
        }
        this.cargando.set(false);
      },
      error: () => {
        // Si no se puede resolver la lista, mostramos el ID
        this.coberturaNombre.set(`Cobertura ID: ${idCobertura}`);
        this.cargando.set(false);
      },
    });
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

  formatearFecha(fecha?: string): string {
    if (!fecha) return 'No especificada';
    // Si viene en formato ISO o YYYY-MM-DD
    try {
      const partes = fecha.split('T')[0].split('-');
      if (partes.length === 3) {
        return `${partes[2]}/${partes[1]}/${partes[0]}`;
      }
      return fecha;
    } catch {
      return fecha;
    }
  }
}
