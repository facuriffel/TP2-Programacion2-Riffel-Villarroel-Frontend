import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-en-construccion',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="en-construccion-container">
      <mat-card class="en-construccion-card" appearance="outlined">
        <mat-card-header class="card-header">
          <div class="icon-badge">
            <mat-icon>construction</mat-icon>
          </div>
          <mat-card-title>Módulo en Construcción</mat-card-title>
          <mat-card-subtitle>Semana 2 y Semana 3</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content class="card-body">
          <p class="description">
            El módulo al que estás intentando acceder se encuentra actualmente en desarrollo y
            estará disponible en las próximas etapas del sistema.
          </p>
          <div class="info-box">
            <mat-icon class="info-icon">info</mat-icon>
            <span>
              Incluye las funcionalidades de gestión avanzada, asignación de turnos, agendas
              médicas y reportes de auditoría.
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
      .en-construccion-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: calc(100vh - 200px);
        padding: 24px 16px;
        box-sizing: border-box;
      }

      .en-construccion-card {
        max-width: 540px;
        width: 100%;
        border-radius: 16px;
        padding: 24px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
        background: var(--mat-sys-surface, #ffffff);
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
        background: #fff3e0;
        color: #e65100;
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
        color: var(--mat-sys-on-surface, #1e293b);
        margin-bottom: 4px;
      }

      mat-card-subtitle {
        font-size: 0.95rem;
        color: #f57c00;
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

      .info-box {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 12px 16px;
        text-align: left;
        font-size: 0.9rem;
        color: #64748b;
      }

      .info-icon {
        color: #0284c7;
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
export class EnConstruccionComponent {}
