import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-acceso-denegado',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="error-container">
      <mat-card class="error-card" appearance="outlined">
        <mat-card-header class="card-header">
          <div class="icon-badge">
            <mat-icon>gpp_bad</mat-icon>
          </div>
          <mat-card-title>403 - Acceso Denegado</mat-card-title>
          <mat-card-subtitle>Permisos Insuficientes</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content class="card-body">
          <p class="description">
            No contás con los privilegios necesarios para ingresar a este módulo. Tu rol actual en el
            sistema no tiene asignado acceso a este recurso.
          </p>
          <div class="hint-box">
            <mat-icon class="hint-icon">lock</mat-icon>
            <span>
              Si considerás que esto es un error, por favor contactá con el administrador de la clínica
              o revisá tu perfil de usuario.
            </span>
          </div>
        </mat-card-content>

        <mat-card-actions class="card-actions" align="end">
          <a mat-flat-button color="primary" routerLink="/">
            <mat-icon>home</mat-icon>
            Volver al Inicio
          </a>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .error-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: calc(100vh - 200px);
        padding: 24px 16px;
        box-sizing: border-box;
      }

      .error-card {
        max-width: 520px;
        width: 100%;
        border-radius: 16px;
        padding: 24px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
        background: var(--mat-sys-surface, #ffffff);
        border-top: 4px solid #dc2626;
      }

      .card-header {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        margin-bottom: 16px;
      }

      .icon-badge {
        width: 72px;
        height: 72px;
        border-radius: 50%;
        background: #fef2f2;
        color: #dc2626;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 16px;
      }

      .icon-badge mat-icon {
        font-size: 38px;
        width: 38px;
        height: 38px;
      }

      mat-card-title {
        font-size: 1.5rem;
        font-weight: 600;
        color: #991b1b;
        margin-bottom: 4px;
      }

      mat-card-subtitle {
        font-size: 0.95rem;
        color: #64748b;
        font-weight: 500;
      }

      .card-body {
        text-align: center;
        padding: 8px 0 16px;
      }

      .description {
        font-size: 1rem;
        line-height: 1.6;
        color: #475569;
        margin-bottom: 20px;
      }

      .hint-box {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        background: #fff7ed;
        border: 1px solid #fed7aa;
        border-radius: 8px;
        padding: 12px 16px;
        text-align: left;
        font-size: 0.9rem;
        color: #9a3412;
      }

      .hint-icon {
        color: #ea580c;
        font-size: 20px;
        width: 20px;
        height: 20px;
        flex-shrink: 0;
        margin-top: 2px;
      }

      .card-actions {
        padding-top: 16px;
        border-top: 1px solid #f1f5f9;
        display: flex;
        justify-content: center;
      }

      .card-actions a mat-icon {
        margin-right: 6px;
      }
    `,
  ],
})
export class AccesoDenegadoComponent {}
