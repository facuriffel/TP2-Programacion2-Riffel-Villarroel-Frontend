import { DatePipe } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, catchError, debounceTime, of, switchMap, tap } from 'rxjs';
import { LogAuditoria } from '../../../core/models/admin.models';
import { AuditoriaService } from '../../../core/services/auditoria.service';
import { aIsoFecha } from '../../../core/utils/fechas';

const ENTIDADES = [
  { valor: 'sede', etiqueta: 'Sede' },
  { valor: 'especialidad', etiqueta: 'Especialidad' },
  { valor: 'cobertura', etiqueta: 'Cobertura' },
  { valor: 'usuario', etiqueta: 'Usuario' },
  { valor: 'agenda', etiqueta: 'Agenda' },
  { valor: 'turno', etiqueta: 'Turno' },
  { valor: 'historial_clinico', etiqueta: 'Historial clínico' },
];

const ACCIONES: Record<LogAuditoria['accion'], string> = {
  ALTA: 'Alta',
  MODIFICACION: 'Modificación',
  BAJA: 'Baja',
};

const CLASES_ACCION: Record<LogAuditoria['accion'], string> = {
  ALTA: 'badge--ok',
  MODIFICACION: 'badge--warn',
  BAJA: 'badge--danger',
};

@Component({
  selector: 'app-auditoria',
  standalone: true,
  imports: [
    DatePipe,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  template: `
    <section class="pagina-admin">
      <header class="pagina-admin__cabecera">
        <div class="pagina-admin__titulos">
          <h1>Auditoría</h1>
          <p class="pagina-admin__bajada">Registro de acciones sensibles realizadas en el sistema.</p>
        </div>
      </header>

      <div class="panel-admin">
        <form class="filtros" [formGroup]="filtros">
          <mat-form-field appearance="outline" subscriptSizing="dynamic">
            <mat-label>Usuario</mat-label>
            <input matInput formControlName="usuario" placeholder="Nombre, apellido o correo" />
          </mat-form-field>

          <mat-form-field appearance="outline" subscriptSizing="dynamic">
            <mat-label>Entidad</mat-label>
            <mat-select formControlName="entidad">
              <mat-option value="">Todas</mat-option>
              @for (entidad of entidades; track entidad.valor) {
                <mat-option [value]="entidad.valor">{{ entidad.etiqueta }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" subscriptSizing="dynamic">
            <mat-label>Rango de fechas</mat-label>
            <mat-date-range-input [rangePicker]="rango" [max]="hoy">
              <input matStartDate formControlName="desde" placeholder="Desde" />
              <input matEndDate formControlName="hasta" placeholder="Hasta" />
            </mat-date-range-input>
            <mat-datepicker-toggle matIconSuffix [for]="rango"></mat-datepicker-toggle>
            <mat-date-range-picker #rango></mat-date-range-picker>
          </mat-form-field>

          <button mat-button type="button" (click)="limpiarFiltros()">Limpiar</button>
        </form>

        @if (cargando()) {
          <div class="estado-cargando">
            <mat-spinner diameter="28"></mat-spinner>
            <span>Cargando registros de auditoría...</span>
          </div>
        } @else if (errorCarga()) {
          <div class="estado-vacio">
            <span>No se pudo cargar la auditoría.</span>
            <button mat-button type="button" (click)="consultar()">Reintentar</button>
          </div>
        } @else if (logs().length === 0) {
          <div class="estado-vacio">No se encontraron registros</div>
        } @else {
          <div class="table-container">
          <table mat-table [dataSource]="logs()" class="tabla-admin">
            <ng-container matColumnDef="fecha">
              <th mat-header-cell *matHeaderCellDef>Fecha</th>
              <td mat-cell *matCellDef="let log">{{ log.fecha | date: 'dd/MM/yyyy HH:mm' }}</td>
            </ng-container>

            <ng-container matColumnDef="usuario">
              <th mat-header-cell *matHeaderCellDef>Usuario</th>
              <td mat-cell *matCellDef="let log">{{ log.apellido }}, {{ log.nombre }}</td>
            </ng-container>

            <ng-container matColumnDef="accion">
              <th mat-header-cell *matHeaderCellDef>Acción</th>
              <td mat-cell *matCellDef="let log"><span [class]="claseAccion(log.accion)">{{ etiquetaAccion(log.accion) }}</span></td>
            </ng-container>

            <ng-container matColumnDef="entidad">
              <th mat-header-cell *matHeaderCellDef>Entidad</th>
              <td mat-cell *matCellDef="let log">{{ etiquetaEntidad(log.entidad) }}</td>
            </ng-container>

            <ng-container matColumnDef="detalle">
              <th mat-header-cell *matHeaderCellDef>Detalle</th>
              <td mat-cell *matCellDef="let log" class="celda-detalle" [matTooltip]="resumen(log)">
                {{ resumen(log) }}
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="columnas"></tr>
            <tr mat-row *matRowDef="let fila; columns: columnas"></tr>
          </table>
          </div>
        }

        <mat-paginator
          [length]="total()"
          [pageSize]="tamano()"
          [pageIndex]="pagina()"
          [pageSizeOptions]="[10, 25, 50]"
          (page)="cambiarPagina($event)"
        ></mat-paginator>
      </div>
    </section>
  `,
  styles: `
    .filtros {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      align-items: center;
      padding: 16px 16px 12px;
    }
    .filtros mat-form-field {
      width: 240px;
    }
    .celda-detalle {
      max-width: 420px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    @media (min-width: 1200px) {
      .tabla-admin {
        min-width: 900px;
      }
    }
    @media (max-width: 768px) {
      .filtros mat-form-field {
        width: 100%;
      }
    }
  `,
})
export class AuditoriaComponent {
  private readonly auditoriaService = inject(AuditoriaService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly consultas = new Subject<void>();

  readonly entidades = ENTIDADES;
  readonly columnas = ['fecha', 'usuario', 'accion', 'entidad', 'detalle'];
  readonly hoy = new Date();

  readonly filtros = new FormGroup({
    usuario: new FormControl('', { nonNullable: true }),
    entidad: new FormControl('', { nonNullable: true }),
    desde: new FormControl<Date | null>(null),
    hasta: new FormControl<Date | null>(null),
  });

  readonly logs = signal<LogAuditoria[]>([]);
  readonly total = signal(0);
  readonly pagina = signal(0);
  readonly tamano = signal(10);
  readonly cargando = signal(true);
  readonly errorCarga = signal(false);

  constructor() {
    this.consultas
      .pipe(
        tap(() => {
          this.cargando.set(true);
          this.errorCarga.set(false);
        }),
        switchMap(() => {
          const { usuario, entidad, desde, hasta } = this.filtros.getRawValue();
          return this.auditoriaService
            .listar({ usuario, entidad, desde: aIsoFecha(desde), hasta: aIsoFecha(hasta) }, this.pagina() + 1, this.tamano())
            .pipe(
              catchError(() => {
                this.errorCarga.set(true);
                return of(null);
              }),
            );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((resultado) => {
        if (resultado) {
          this.logs.set(resultado.items);
          this.total.set(resultado.total);
        }
        this.cargando.set(false);
      });

    this.filtros.valueChanges
      .pipe(debounceTime(300), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.pagina.set(0);
        this.consultar();
      });

    this.consultar();
  }

  consultar(): void {
    this.consultas.next();
  }

  cambiarPagina(evento: PageEvent): void {
    this.pagina.set(evento.pageIndex);
    this.tamano.set(evento.pageSize);
    this.consultar();
  }

  limpiarFiltros(): void {
    this.filtros.reset({ usuario: '', entidad: '', desde: null, hasta: null });
  }

  claseAccion(accion: LogAuditoria['accion']): string {
    return `badge ${CLASES_ACCION[accion]}`;
  }

  etiquetaAccion(accion: LogAuditoria['accion']): string {
    return ACCIONES[accion] ?? accion;
  }

  etiquetaEntidad(entidad: string): string {
    return ENTIDADES.find((e) => e.valor === entidad)?.etiqueta ?? entidad;
  }

  resumen(log: LogAuditoria): string {
    try {
      const detalle = JSON.parse(log.detalle) as { parametros?: Record<string, unknown>; body?: Record<string, unknown> };
      const campos = { ...detalle.parametros, ...detalle.body };
      const partes = Object.entries(campos)
        .filter(([clave]) => clave !== 'password')
        .map(([clave, valor]) => `${clave}: ${Array.isArray(valor) ? valor.join(', ') : String(valor)}`);
      return partes.length > 0 ? partes.join(' · ') : '—';
    } catch {
      return log.detalle || '—';
    }
  }
}
