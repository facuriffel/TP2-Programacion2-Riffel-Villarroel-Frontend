import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="not-found-container">
      <mat-card class="not-found-card" appearance="outlined">
        <mat-card-header class="card-header">
          <div class="icon-badge">
            <mat-icon>search_off</mat-icon>
          </div>
          <mat-card-title>404 - Página No Encontrada</mat-card-title>
          <mat-card-subtitle>Ruta Inexistente</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content class="card-body">
          <p class="description">
            La dirección a la que intentás ingresar no existe, fue eliminada o cambió de ubicación.
          </p>
          <div class="info-box">
            <mat-icon class="info-icon">help_outline</mat-icon>
            <span>
              Verificá que la URL escrita sea la correcta o regresá al panel principal de la clínica
              para continuar navegando.
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
      .not-found-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: calc(100vh - 200px);
        padding: 24px 16px;
        box-sizing: border-box;
      }

      .not-found-card {
        max-width: 520px;
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
        background: #f1f5f9;
        color: #475569;
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
export class NotFoundComponent {}
