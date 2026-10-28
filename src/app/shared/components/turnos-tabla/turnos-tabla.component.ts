import { DatePipe } from '@angular/common';
import { Component, input, output, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EstadoTurno, Turno } from '../../../core/models/clinica.models';
import { calcularEdad } from '../../../core/utils/fechas';

const ETIQUETAS_ESTADO: Record<EstadoTurno, string> = {
  confirmado: 'Confirmado',
  atendido: 'Atendido',
  cancelado: 'Cancelado',
};

const CLASES_ESTADO: Record<EstadoTurno, string> = {
  confirmado: 'badge--ok',
  atendido: 'badge--info',
  cancelado: 'badge--danger',
};

@Component({
  selector: 'app-turnos-tabla',
  standalone: true,
  imports: [DatePipe, MatTableModule, MatButtonModule, MatIconModule, MatTooltipModule],
  template: `
    @if (turnos().length === 0) {
      <div class="estado-vacio">No se encontraron registros</div>
    } @else {
      <div class="table-container">
      <table mat-table multiTemplateDataRows [dataSource]="turnos()" class="tabla-admin">
        <ng-container matColumnDef="expandir">
          <th mat-header-cell *matHeaderCellDef></th>
          <td mat-cell *matCellDef="let turno" class="columna-expandir">
            <button
              mat-icon-button
              type="button"
              [attr.aria-label]="'Ver nota del paciente'"
              [attr.aria-expanded]="expandido() === turno.id"
              (click)="alternar(turno)"
            >
              <mat-icon>{{ expandido() === turno.id ? 'expand_less' : 'expand_more' }}</mat-icon>
            </button>
          </td>
        </ng-container>

        <ng-container matColumnDef="fecha">
          <th mat-header-cell *matHeaderCellDef>Fecha</th>
          <td mat-cell *matCellDef="let turno">{{ turno.fecha | date: 'dd/MM/yyyy' }}</td>
        </ng-container>

        <ng-container matColumnDef="hora">
          <th mat-header-cell *matHeaderCellDef>Hora</th>
          <td mat-cell *matCellDef="let turno">{{ turno.hora }}</td>
        </ng-container>

        <ng-container matColumnDef="paciente">
          <th mat-header-cell *matHeaderCellDef>Paciente</th>
          <td mat-cell *matCellDef="let turno">{{ turno.paciente_apellido }}, {{ turno.paciente_nombre }}</td>
        </ng-container>

        <ng-container matColumnDef="edad">
          <th mat-header-cell *matHeaderCellDef>Edad</th>
          <td mat-cell *matCellDef="let turno">{{ edadDe(turno) }}</td>
        </ng-container>

        <ng-container matColumnDef="dni">
          <th mat-header-cell *matHeaderCellDef>DNI</th>
          <td mat-cell *matCellDef="let turno">{{ turno.paciente_dni }}</td>
        </ng-container>

        <ng-container matColumnDef="medico">
          <th mat-header-cell *matHeaderCellDef>Médico</th>
          <td mat-cell *matCellDef="let turno">{{ turno.medico_apellido }}, {{ turno.medico_nombre }}</td>
        </ng-container>

        <ng-container matColumnDef="especialidad">
          <th mat-header-cell *matHeaderCellDef>Especialidad</th>
          <td mat-cell *matCellDef="let turno">{{ turno.especialidad }}</td>
        </ng-container>

        <ng-container matColumnDef="sede">
          <th mat-header-cell *matHeaderCellDef>Sede</th>
          <td mat-cell *matCellDef="let turno">{{ turno.sede }}</td>
        </ng-container>

        <ng-container matColumnDef="estado">
          <th mat-header-cell *matHeaderCellDef>Estado</th>
          <td mat-cell *matCellDef="let turno">
            <span [class]="claseEstado(turno.estado)">{{ etiqueta(turno.estado) }}</span>
          </td>
        </ng-container>

        <ng-container matColumnDef="acciones">
          <th mat-header-cell *matHeaderCellDef class="columna-acciones"></th>
          <td mat-cell *matCellDef="let turno" class="columna-acciones">
            @if (turno.estado === 'confirmado') {
              @if (permitirAtender()) {
                <button
                  mat-icon-button
                  type="button"
                  matTooltip="Marcar como atendido"
                  aria-label="Marcar como atendido"
                  (click)="atender.emit(turno)"
                >
                  <mat-icon>task_alt</mat-icon>
                </button>
              }
              <button
                mat-icon-button
                type="button"
                matTooltip="Cancelar turno"
                aria-label="Cancelar turno"
                (click)="cancelar.emit(turno)"
              >
                <mat-icon>event_busy</mat-icon>
              </button>
            }
          </td>
        </ng-container>

        <ng-container matColumnDef="detalle">
          <td mat-cell *matCellDef="let turno" [attr.colspan]="columnas().length">
            @if (expandido() === turno.id) {
              <div class="detalle">
                <strong>Nota del paciente</strong>
                <p>{{ turno.nota || 'Sin nota' }}</p>
              </div>
            }
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="columnas()"></tr>
        <tr mat-row *matRowDef="let turno; columns: columnas()"></tr>
        <tr mat-row *matRowDef="let turno; columns: ['detalle']" class="fila-detalle"></tr>
      </table>
      </div>
    }
  `,
  styles: `
    .columna-expandir {
      width: 48px;
    }
    .fila-detalle {
      height: 0;
    }
    .fila-detalle td {
      padding: 0 16px;
      border-bottom: 0;
    }
    .detalle {
      padding: 8px 0 12px 48px;
      color: #334155;
    }
    .detalle p {
      margin: 4px 0 0;
      white-space: pre-wrap;
    }
  `,
})
export class TurnosTablaComponent {
  readonly turnos = input.required<Turno[]>();
  readonly columnas = input<string[]>([
    'expandir', 'fecha', 'hora', 'paciente', 'dni', 'especialidad', 'sede', 'estado', 'acciones',
  ]);
  readonly permitirAtender = input(false);

  readonly atender = output<Turno>();
  readonly cancelar = output<Turno>();

  readonly expandido = signal<number | null>(null);

  alternar(turno: Turno): void {
    this.expandido.update((actual) => (actual === turno.id ? null : turno.id));
  }

  edadDe(turno: Turno): string {
    const edad = calcularEdad(turno.paciente_fecha_nacimiento);
    return edad === null ? '—' : `${edad} años`;
  }

  claseEstado(estado: EstadoTurno): string {
    return `badge ${CLASES_ESTADO[estado]}`;
  }

  etiqueta(estado: EstadoTurno): string {
    return ETIQUETAS_ESTADO[estado] ?? estado;
  }
}
