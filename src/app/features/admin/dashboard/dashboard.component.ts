import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, catchError, debounceTime, forkJoin, of, switchMap, tap } from 'rxjs';
import {
  RankingMedico,
  TasaCancelacion,
  TurnosPorEspecialidad,
  TurnosPorSede,
} from '../../../core/models/admin.models';
import { ReporteService } from '../../../core/services/reporte.service';
import { aIsoFecha, hoy } from '../../../core/utils/fechas';
import { GraficoComponent } from '../../../shared/components/grafico/grafico.component';

interface Indicadores {
  especialidades: TurnosPorEspecialidad[];
  sedes: TurnosPorSede[];
  ranking: RankingMedico[];
  cancelacion: TasaCancelacion;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    GraficoComponent,
  ],
  template: `
    <section class="pagina-admin">
      <header class="pagina-admin__cabecera">
        <div class="pagina-admin__titulos">
          <h1>Reportes y estadísticas</h1>
          <p class="pagina-admin__bajada">Indicadores de turnos y atención en el período seleccionado.</p>
        </div>
        <form class="filtro-fechas" [formGroup]="rango">
          <mat-form-field appearance="outline" subscriptSizing="dynamic">
            <mat-label>Rango de fechas</mat-label>
            <mat-date-range-input [rangePicker]="selector">
              <input matStartDate formControlName="desde" placeholder="Desde" />
              <input matEndDate formControlName="hasta" placeholder="Hasta" />
            </mat-date-range-input>
            <mat-datepicker-toggle matIconSuffix [for]="selector"></mat-datepicker-toggle>
            <mat-date-range-picker #selector></mat-date-range-picker>
          </mat-form-field>
          <button mat-button type="button" (click)="limpiarRango()">Limpiar</button>
        </form>
      </header>

      @if (cargando()) {
        <div class="panel-admin estado-cargando">
          <mat-spinner diameter="28"></mat-spinner>
          <span>Cargando indicadores...</span>
        </div>
      } @else if (errorCarga()) {
        <div class="panel-admin estado-vacio">
          <span>No se pudieron cargar los indicadores.</span>
          <button mat-button type="button" (click)="consultar()">Reintentar</button>
        </div>
      } @else if (indicadores(); as datos) {
        @if (datos.cancelacion.total_turnos === 0) {
          <div class="panel-admin estado-vacio">Sin datos en el período</div>
        } @else {
        <div class="resumen">
          <div class="panel-admin indicador indicador--warn">
            <span class="indicador__etiqueta">Tasa de cancelación</span>
            <span class="indicador__valor">{{ datos.cancelacion.tasa_cancelacion }}%</span>
            <span class="indicador__detalle">
              {{ datos.cancelacion.turnos_cancelados }} cancelados de {{ datos.cancelacion.total_turnos }} turnos
            </span>
          </div>
          <div class="panel-admin indicador indicador--ok">
            <span class="indicador__etiqueta">Turnos en el período</span>
            <span class="indicador__valor">{{ datos.cancelacion.total_turnos }}</span>
            <span class="indicador__detalle">Confirmados, atendidos y cancelados</span>
          </div>
        </div>

        <div class="grilla">
          <div class="panel-admin bloque">
            <h2>Turnos por especialidad</h2>
            @if (datos.especialidades.length === 0) {
              <div class="estado-vacio">No se encontraron registros</div>
            } @else {
              <app-grafico
                tipo="bar"
                serie="Turnos"
                descripcion="Gráfico de barras de turnos por especialidad"
                [etiquetas]="etiquetasEspecialidades()"
                [valores]="valoresEspecialidades()"
              />
            }
          </div>

          <div class="panel-admin bloque">
            <h2>Turnos por sede</h2>
            @if (datos.sedes.length === 0) {
              <div class="estado-vacio">No se encontraron registros</div>
            } @else {
              <app-grafico
                tipo="doughnut"
                serie="Turnos"
                descripcion="Gráfico de torta de turnos por sede"
                [etiquetas]="etiquetasSedes()"
                [valores]="valoresSedes()"
              />
            }
          </div>
        </div>

        <div class="panel-admin bloque ranking">
          <h2>Ranking de médicos por turnos atendidos</h2>
          @if (datos.ranking.length === 0) {
            <div class="estado-vacio">No se encontraron registros</div>
          } @else {
            <div class="table-container">
            <table mat-table [dataSource]="datos.ranking" class="tabla-admin">
              <ng-container matColumnDef="posicion">
                <th mat-header-cell *matHeaderCellDef>#</th>
                <td mat-cell *matCellDef="let fila; let i = index">{{ i + 1 }}</td>
              </ng-container>

              <ng-container matColumnDef="medico">
                <th mat-header-cell *matHeaderCellDef>Médico</th>
                <td mat-cell *matCellDef="let fila">{{ fila.apellido }}, {{ fila.nombre }}</td>
              </ng-container>

              <ng-container matColumnDef="cantidad">
                <th mat-header-cell *matHeaderCellDef>Turnos atendidos</th>
                <td mat-cell *matCellDef="let fila">{{ fila.cantidad_turnos }}</td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="columnasRanking"></tr>
              <tr mat-row *matRowDef="let fila; columns: columnasRanking"></tr>
            </table>
            </div>
          }
        </div>
        }
      }
    </section>
  `,
  styles: `
    .filtro-fechas {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .filtro-fechas mat-form-field {
      width: 260px;
    }
    .resumen {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 16px;
      margin-bottom: 16px;
    }
    .indicador {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 16px 20px;
    }
    .indicador--ok {
      background: #ecfdf5;
      border-color: #a7f3d0;
    }
    .indicador--warn {
      background: #fffbeb;
      border-color: #fde68a;
    }
    .indicador__etiqueta {
      color: #475569;
      font: var(--mat-sys-label-large);
    }
    .indicador__valor {
      font: var(--mat-sys-headline-medium);
    }
    .indicador__detalle {
      color: #64748b;
      font: var(--mat-sys-body-small);
    }
    .grilla {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 16px;
      margin-bottom: 16px;
    }
    .bloque {
      padding: 16px 20px;
    }
    .bloque h2 {
      margin: 0 0 12px;
      font: var(--mat-sys-title-medium);
    }
  `,
})
export class DashboardComponent {
  private readonly reporteService = inject(ReporteService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly consultas = new Subject<void>();

  readonly columnasRanking = ['posicion', 'medico', 'cantidad'];

  readonly rango = new FormGroup({
    desde: new FormControl<Date | null>(this.inicioDeMes()),
    hasta: new FormControl<Date | null>(hoy()),
  });

  readonly indicadores = signal<Indicadores | null>(null);
  readonly cargando = signal(true);
  readonly errorCarga = signal(false);

  readonly etiquetasEspecialidades = computed(() => this.indicadores()?.especialidades.map((e) => e.descripcion) ?? []);
  readonly valoresEspecialidades = computed(() => this.indicadores()?.especialidades.map((e) => e.cantidad_turnos) ?? []);
  readonly etiquetasSedes = computed(() => this.indicadores()?.sedes.map((s) => s.nombre) ?? []);
  readonly valoresSedes = computed(() => this.indicadores()?.sedes.map((s) => s.cantidad_turnos) ?? []);

  constructor() {
    this.consultas
      .pipe(
        tap(() => {
          this.cargando.set(true);
          this.errorCarga.set(false);
        }),
        switchMap(() => {
          const { desde, hasta } = this.rango.getRawValue();
          if (desde && hasta && desde > hasta) {
            this.errorCarga.set(true);
            return of(null);
          }
          const filtro = { desde: aIsoFecha(desde), hasta: aIsoFecha(hasta) };
          return forkJoin({
            especialidades: this.reporteService.turnosPorEspecialidad(filtro),
            sedes: this.reporteService.turnosPorSede(filtro),
            ranking: this.reporteService.rankingMedicos(filtro),
            cancelacion: this.reporteService.tasaCancelacion(filtro),
          }).pipe(
            catchError(() => {
              this.errorCarga.set(true);
              return of(null);
            }),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((resultado) => {
        if (resultado) this.indicadores.set(resultado);
        this.cargando.set(false);
      });

    this.rango.valueChanges.pipe(debounceTime(300), takeUntilDestroyed(this.destroyRef)).subscribe(() => this.consultar());

    this.consultar();
  }

  consultar(): void {
    this.consultas.next();
  }

  limpiarRango(): void {
    this.rango.reset({ desde: this.inicioDeMes(), hasta: hoy() });
  }

  private inicioDeMes(): Date {
    const actual = hoy();
    return new Date(actual.getFullYear(), actual.getMonth(), 1);
  }
}
