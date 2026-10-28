import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Sede } from '../../core/models/admin.models';
import { Turno } from '../../core/models/clinica.models';
import { ConsultaService } from '../../core/services/consulta.service';
import { NotificadorService } from '../../core/services/notificador.service';
import { TurnoService } from '../../core/services/turno.service';
import { aIsoFecha, hoy } from '../../core/utils/fechas';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { TurnosTablaComponent } from '../../shared/components/turnos-tabla/turnos-tabla.component';
import { AtenderDialogComponent } from './atender-dialog.component';

@Component({
  selector: 'app-medico-turnos',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    TurnosTablaComponent,
  ],
  template: `
    <section class="pagina-admin">
      <header class="pagina-admin__cabecera">
        <div class="pagina-admin__titulos">
          <h1>Turnos programados</h1>
          <p class="pagina-admin__bajada">Turnos confirmados del día en las sedes donde atendés.</p>
        </div>
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

          <button mat-button type="button" (click)="volverAHoy()">Hoy</button>
        </form>

        @if (cargando()) {
          <div class="estado-cargando">
            <mat-spinner diameter="28"></mat-spinner>
            <span>Cargando turnos...</span>
          </div>
        } @else if (errorCarga()) {
          <div class="estado-vacio">
            <span>No se pudieron cargar los turnos.</span>
            <button mat-button type="button" (click)="cargar()">Reintentar</button>
          </div>
        } @else {
          <app-turnos-tabla
            [turnos]="turnos()"
            [columnas]="columnas"
            [permitirAtender]="true"
            (atender)="atender($event)"
            (cancelar)="cancelar($event)"
          />
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
export class MedicoTurnosComponent {
  private readonly turnoService = inject(TurnoService);
  private readonly consultaService = inject(ConsultaService);
  private readonly notificador = inject(NotificadorService);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);

  readonly columnas = ['expandir', 'hora', 'paciente', 'edad', 'sede', 'especialidad', 'estado', 'acciones'];
  readonly turnos = signal<Turno[]>([]);
  readonly sedes = signal<Sede[]>([]);
  readonly cargando = signal(true);
  readonly errorCarga = signal(false);

  readonly filtros = new FormGroup({
    fecha: new FormControl<Date | null>(hoy()),
    id_sede: new FormControl<number | null>(null),
  });

  constructor() {
    this.consultaService
      .sedes()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (sedes) => this.sedes.set(sedes) });

    this.filtros.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.cargar());
    this.cargar();
  }

  cargar(): void {
    const { fecha, id_sede } = this.filtros.getRawValue();

    this.cargando.set(true);
    this.errorCarga.set(false);
    this.turnoService
      .listar({ fecha: aIsoFecha(fecha) ?? undefined, id_sede })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (turnos) => {
          this.turnos.set(turnos);
          this.cargando.set(false);
        },
        error: () => {
          this.errorCarga.set(true);
          this.cargando.set(false);
        },
      });
  }

  volverAHoy(): void {
    this.filtros.patchValue({ fecha: hoy() });
  }

  atender(turno: Turno): void {
    this.dialog
      .open(AtenderDialogComponent, { data: turno, width: '640px', maxWidth: '95vw' })
      .afterClosed()
      .subscribe((atendido) => {
        if (atendido) this.cargar();
      });
  }

  cancelar(turno: Turno): void {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          titulo: 'Cancelar turno',
          mensaje: `¿Cancelar el turno de ${turno.paciente_apellido}, ${turno.paciente_nombre} a las ${turno.hora}? Se notificará al paciente.`,
          textoConfirmar: 'Cancelar turno',
        },
      })
      .afterClosed()
      .subscribe((confirmado) => {
        if (!confirmado) return;
        this.turnoService.cancelar(turno.id).subscribe({
          next: (mensaje) => {
            this.notificador.exito(mensaje);
            this.cargar();
          },
          error: (err) => this.notificador.errorApi(err, 'No se pudo cancelar el turno'),
        });
      });
  }
}
