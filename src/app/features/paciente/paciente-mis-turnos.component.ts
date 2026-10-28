import { DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EstadoTurno, RegistroHistorial, Turno } from '../../core/models/clinica.models';
import { HistorialService } from '../../core/services/historial.service';
import { NotificadorService } from '../../core/services/notificador.service';
import { TurnoService } from '../../core/services/turno.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

const ETIQUETAS_ESTADO: Record<EstadoTurno, string> = {
  confirmado: 'Confirmado',
  atendido: 'Atendido',
  cancelado: 'Cancelado',
};

@Component({
  selector: 'app-paciente-mis-turnos',
  standalone: true,
  imports: [DatePipe, RouterLink, MatTableModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <section class="pagina-admin">
      <header class="pagina-admin__cabecera">
        <div class="pagina-admin__titulos">
          <h1>Mis turnos</h1>
          <p class="pagina-admin__bajada">Tus turnos, del más próximo al menos próximo.</p>
        </div>
        <a mat-flat-button routerLink="/paciente/nuevo-turno">
          <mat-icon>add</mat-icon>
          Solicitar turno
        </a>
      </header>

      <div class="panel-admin">
        @if (cargando()) {
          <div class="estado-cargando"><mat-spinner diameter="28"></mat-spinner><span>Cargando turnos...</span></div>
        } @else if (turnosOrdenados().length === 0) {
          <div class="estado-vacio">No se encontraron registros</div>
        } @else {
          <div class="table-container">
          <table mat-table multiTemplateDataRows [dataSource]="turnosOrdenados()" class="tabla-admin">
            <ng-container matColumnDef="expandir">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let turno" class="columna-expandir">
                <button
                  mat-icon-button
                  type="button"
                  aria-label="Ver detalle del turno"
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

            <ng-container matColumnDef="medico">
              <th mat-header-cell *matHeaderCellDef>Médico</th>
              <td mat-cell *matCellDef="let turno">{{ turno.medico_apellido }}, {{ turno.medico_nombre }}</td>
            </ng-container>

            <ng-container matColumnDef="especialidad">
              <th mat-header-cell *matHeaderCellDef>Especialidad</th>
              <td mat-cell *matCellDef="let turno">{{ turno.especialidad }}</td>
            </ng-container>

            <ng-container matColumnDef="estado">
              <th mat-header-cell *matHeaderCellDef>Estado</th>
              <td mat-cell *matCellDef="let turno">
                <span class="estado" [attr.data-estado]="turno.estado">{{ etiqueta(turno.estado) }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="acciones">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let turno" class="columna-acciones">
                @if (turno.estado === 'confirmado') {
                  <button mat-stroked-button type="button" [disabled]="cancelando() === turno.id" (click)="cancelar(turno)">
                    Cancelar
                  </button>
                }
              </td>
            </ng-container>

            <ng-container matColumnDef="detalle">
              <td mat-cell *matCellDef="let turno" [attr.colspan]="columnas.length">
                @if (expandido() === turno.id) {
                  <div class="detalle">
                    <dl>
                      <dt>Fecha</dt>
                      <dd>{{ turno.fecha | date: 'fullDate' }} · {{ turno.hora }} hs</dd>
                      <dt>Especialista</dt>
                      <dd>{{ turno.medico_apellido }}, {{ turno.medico_nombre }}</dd>
                      <dt>Especialidad</dt>
                      <dd>{{ turno.especialidad }}</dd>
                      <dt>Sede</dt>
                      <dd>{{ turno.sede }}</dd>
                      @if (turno.nota) {
                        <dt>Mi nota</dt>
                        <dd>{{ turno.nota }}</dd>
                      }
                    </dl>

                    @if (turno.estado === 'atendido') {
                      <div class="historial">
                        <h3>Historial clínico</h3>
                        @if (historialDe(turno.id); as registro) {
                          <dl>
                            <dt>Diagnóstico</dt>
                            <dd>{{ registro.diagnostico }}</dd>
                            <dt>Tratamiento</dt>
                            <dd>{{ registro.tratamiento }}</dd>
                            <dt>Observaciones</dt>
                            <dd>{{ registro.observaciones || 'Sin observaciones' }}</dd>
                          </dl>
                        } @else {
                          <p class="aviso">El médico todavía no cargó el historial de este turno.</p>
                        }
                      </div>
                    }
                  </div>
                }
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="columnas"></tr>
            <tr mat-row *matRowDef="let turno; columns: columnas" class="fila-turno"></tr>
            <tr mat-row *matRowDef="let turno; columns: ['detalle']" class="fila-detalle"></tr>
          </table>
          </div>
        }
      </div>
    </section>
  `,
  styles: `
    .columna-expandir {
      width: 56px;
    }
    .fila-detalle td {
      padding: 0;
      border-bottom-width: 0;
    }
    .fila-detalle:not(:has(.detalle)) {
      height: 0;
    }
    .detalle {
      padding: 8px 24px 16px 72px;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
    }
    dl {
      display: grid;
      grid-template-columns: 120px 1fr;
      gap: 4px 16px;
      margin: 8px 0;
    }
    dt {
      color: #64748b;
      font-weight: 500;
    }
    dd {
      margin: 0;
    }
    .historial {
      margin-top: 12px;
      padding-top: 8px;
      border-top: 1px solid #e2e8f0;
    }
    .historial h3 {
      margin: 0;
      font: var(--mat-sys-title-small);
    }
    .aviso {
      margin: 8px 0 0;
      color: #475569;
    }
    .estado {
      display: inline-block;
      padding: 2px 10px;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 500;
      border: 1px solid transparent;
    }
    .estado[data-estado='confirmado'] {
      color: #1e40af;
      background: #dbeafe;
      border-color: #bfdbfe;
    }
    .estado[data-estado='atendido'] {
      color: #166534;
      background: #dcfce7;
      border-color: #bbf7d0;
    }
    .estado[data-estado='cancelado'] {
      color: #991b1b;
      background: #fee2e2;
      border-color: #fecaca;
    }
  `,
})
export class PacienteMisTurnosComponent implements OnInit {
  private readonly turnoService = inject(TurnoService);
  private readonly historialService = inject(HistorialService);
  private readonly notificador = inject(NotificadorService);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);

  readonly columnas = ['expandir', 'fecha', 'hora', 'medico', 'especialidad', 'estado', 'acciones'];

  readonly cargando = signal(true);
  readonly cancelando = signal<number | null>(null);
  readonly expandido = signal<number | null>(null);
  private readonly turnos = signal<Turno[]>([]);
  private readonly historial = signal<RegistroHistorial[]>([]);

  /** Primero los turnos por venir (el más próximo arriba) y luego los pasados, del más reciente al más antiguo. */
  readonly turnosOrdenados = computed(() => {
    const ahora = Date.now();
    const instante = (t: Turno) => new Date(`${t.fecha.slice(0, 10)}T${t.hora}`).getTime();
    const proximos = this.turnos().filter((t) => instante(t) >= ahora).sort((a, b) => instante(a) - instante(b));
    const pasados = this.turnos().filter((t) => instante(t) < ahora).sort((a, b) => instante(b) - instante(a));
    return [...proximos, ...pasados];
  });

  ngOnInit(): void {
    this.cargar();
  }

  etiqueta(estado: EstadoTurno): string {
    return ETIQUETAS_ESTADO[estado];
  }

  historialDe(idTurno: number): RegistroHistorial | undefined {
    return this.historial().find((r) => r.id_turno === idTurno);
  }

  alternar(turno: Turno): void {
    this.expandido.set(this.expandido() === turno.id ? null : turno.id);
  }

  cancelar(turno: Turno): void {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          titulo: 'Cancelar turno',
          mensaje: `¿Está seguro de cancelar el turno del ${turno.fecha.slice(8, 10)}/${turno.fecha.slice(5, 7)}/${turno.fecha.slice(0, 4)} a las ${turno.hora} hs?`,
          textoConfirmar: 'Cancelar turno',
        },
      })
      .afterClosed()
      .subscribe((confirmado) => {
        if (!confirmado) return;
        this.cancelando.set(turno.id);
        this.turnoService.cancelar(turno.id).subscribe({
          next: (mensaje) => {
            this.cancelando.set(null);
            this.notificador.exito(mensaje);
            this.cargar();
          },
          error: (err) => {
            this.cancelando.set(null);
            this.notificador.errorApi(err, 'No se pudo cancelar el turno');
          },
        });
      });
  }

  private cargar(): void {
    this.cargando.set(true);
    forkJoin({ turnos: this.turnoService.listar(), historial: this.historialService.propio() })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ turnos, historial }) => {
          this.turnos.set(turnos);
          this.historial.set(historial);
          this.cargando.set(false);
        },
        error: (err) => {
          this.cargando.set(false);
          this.notificador.errorApi(err, 'No se pudieron cargar tus turnos');
        },
      });
  }
}
