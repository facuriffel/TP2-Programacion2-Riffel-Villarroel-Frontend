import { DatePipe } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { forkJoin } from 'rxjs';
import { Sede } from '../../core/models/admin.models';
import { AgendaItem, MedicoResumen } from '../../core/models/clinica.models';
import { AgendaService } from '../../core/services/agenda.service';
import { AuthService } from '../../core/services/auth.service';
import { ConsultaService } from '../../core/services/consulta.service';
import { NotificadorService } from '../../core/services/notificador.service';
import { aIsoFecha, hoy } from '../../core/utils/fechas';
import { AgendaDialogComponent } from '../../shared/components/agenda-dialog/agenda-dialog.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

const MENSAJE_CON_TURNOS =
  'La agenda tiene turnos confirmados. Cancelá los turnos antes de modificarla o eliminarla.';

@Component({
  selector: 'app-medico-agenda',
  standalone: true,
  imports: [
    DatePipe,
    ReactiveFormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  template: `
    <section class="pagina-admin">
      <header class="pagina-admin__cabecera">
        <div class="pagina-admin__titulos">
          <h1>Mi agenda</h1>
          <p class="pagina-admin__bajada">Rangos horarios de atención por fecha y sede.</p>
        </div>
        <button mat-flat-button type="button" [disabled]="!catalogosListos()" (click)="abrirFormulario(null)">
          <mat-icon>add</mat-icon>
          Nueva agenda
        </button>
      </header>

      <div class="panel-admin">
        <form class="filtros" [formGroup]="filtros">
          <mat-form-field appearance="outline" subscriptSizing="dynamic">
            <mat-label>Fecha</mat-label>
            <input matInput [matDatepicker]="selector" formControlName="fecha" />
            <mat-datepicker-toggle matIconSuffix [for]="selector"></mat-datepicker-toggle>
            <mat-datepicker #selector></mat-datepicker>
          </mat-form-field>

          <mat-form-field appearance="outline" subscriptSizing="dynamic">
            <mat-label>Sede</mat-label>
            <mat-select formControlName="id_sede">
              <mat-option [value]="null">Todas</mat-option>
              @for (sede of sedes(); track sede.id) {
                <mat-option [value]="sede.id">{{ sede.nombre }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <button mat-button type="button" (click)="limpiarFiltros()">Ver próximas</button>
        </form>

        @if (cargando()) {
          <div class="estado-cargando">
            <mat-spinner diameter="28"></mat-spinner>
            <span>Cargando agenda...</span>
          </div>
        } @else if (errorCarga()) {
          <div class="estado-vacio">
            <span>No se pudo cargar la agenda.</span>
            <button mat-button type="button" (click)="cargar()">Reintentar</button>
          </div>
        } @else if (agenda().length === 0) {
          <div class="estado-vacio">No se encontraron registros</div>
        } @else {
          <div class="table-container">
          <table mat-table [dataSource]="agenda()" class="tabla-admin">
            <ng-container matColumnDef="fecha">
              <th mat-header-cell *matHeaderCellDef>Fecha</th>
              <td mat-cell *matCellDef="let item">{{ item.fecha | date: 'dd/MM/yyyy' }}</td>
            </ng-container>

            <ng-container matColumnDef="horario">
              <th mat-header-cell *matHeaderCellDef>Horario</th>
              <td mat-cell *matCellDef="let item">{{ item.hora_entrada }} a {{ item.hora_salida }}</td>
            </ng-container>

            <ng-container matColumnDef="especialidad">
              <th mat-header-cell *matHeaderCellDef>Especialidad</th>
              <td mat-cell *matCellDef="let item">{{ item.especialidad }}</td>
            </ng-container>

            <ng-container matColumnDef="sede">
              <th mat-header-cell *matHeaderCellDef>Sede</th>
              <td mat-cell *matCellDef="let item">{{ item.sede }}</td>
            </ng-container>

            <ng-container matColumnDef="turnos">
              <th mat-header-cell *matHeaderCellDef>Turnos confirmados</th>
              <td mat-cell *matCellDef="let item">{{ item.turnos_confirmados }}</td>
            </ng-container>

            <ng-container matColumnDef="acciones">
              <th mat-header-cell *matHeaderCellDef class="columna-acciones"></th>
              <td mat-cell *matCellDef="let item" class="columna-acciones">
                <button mat-icon-button type="button" matTooltip="Modificar" aria-label="Modificar" (click)="abrirFormulario(item)">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button type="button" matTooltip="Eliminar" aria-label="Eliminar" (click)="eliminar(item)">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="columnas"></tr>
            <tr mat-row *matRowDef="let fila; columns: columnas"></tr>
          </table>
          </div>
        }
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
      width: 200px;
    }
  `,
})
export class MedicoAgendaComponent {
  private readonly agendaService = inject(AgendaService);
  private readonly consultaService = inject(ConsultaService);
  private readonly authService = inject(AuthService);
  private readonly notificador = inject(NotificadorService);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);

  readonly columnas = ['fecha', 'horario', 'especialidad', 'sede', 'turnos', 'acciones'];
  readonly agenda = signal<AgendaItem[]>([]);
  readonly sedes = signal<Sede[]>([]);
  readonly yo = signal<MedicoResumen | null>(null);
  readonly cargando = signal(true);
  readonly errorCarga = signal(false);
  readonly catalogosListos = signal(false);

  readonly filtros = new FormGroup({
    fecha: new FormControl<Date | null>(null),
    id_sede: new FormControl<number | null>(null),
  });

  constructor() {
    forkJoin({ sedes: this.consultaService.sedes(), medicos: this.consultaService.medicos() })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ sedes, medicos }) => {
          this.sedes.set(sedes);
          this.yo.set(medicos.find((m) => m.id === this.authService.currentUser()?.id) ?? null);
          this.catalogosListos.set(true);
        },
        error: (err) => this.notificador.errorApi(err, 'No se pudieron cargar los datos del formulario'),
      });

    this.filtros.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.cargar());
    this.cargar();
  }

  cargar(): void {
    const { fecha, id_sede } = this.filtros.getRawValue();
    const fechaIso = aIsoFecha(fecha);

    this.cargando.set(true);
    this.errorCarga.set(false);
    this.agendaService
      .listar({ fecha: fechaIso ?? undefined, desde: fechaIso ? undefined : aIsoFecha(hoy())!, id_sede })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (agenda) => {
          this.agenda.set(agenda);
          this.cargando.set(false);
        },
        error: () => {
          this.errorCarga.set(true);
          this.cargando.set(false);
        },
      });
  }

  limpiarFiltros(): void {
    this.filtros.reset({ fecha: null, id_sede: null });
  }

  abrirFormulario(agenda: AgendaItem | null): void {
    const medico = this.yo();
    if (!medico) return;
    if (agenda && agenda.turnos_confirmados > 0) {
      this.notificador.error(MENSAJE_CON_TURNOS);
      return;
    }

    this.dialog
      .open(AgendaDialogComponent, {
        data: { agenda, medicos: [medico], sedes: this.sedes(), idMedicoFijo: medico.id },
      })
      .afterClosed()
      .subscribe((guardado) => {
        if (guardado) this.cargar();
      });
  }

  eliminar(agenda: AgendaItem): void {
    if (agenda.turnos_confirmados > 0) {
      this.notificador.error(MENSAJE_CON_TURNOS);
      return;
    }

    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          titulo: 'Eliminar agenda',
          mensaje: `¿Eliminar el rango ${agenda.hora_entrada} a ${agenda.hora_salida} del ${agenda.fecha.split('-').reverse().join('/')}?`,
        },
      })
      .afterClosed()
      .subscribe((confirmado) => {
        if (!confirmado) return;
        this.agendaService.eliminar(agenda.id).subscribe({
          next: (mensaje) => {
            this.notificador.exito(mensaje);
            this.cargar();
          },
          error: (err) => this.notificador.errorApi(err, 'No se pudo eliminar la agenda'),
        });
      });
  }
}
