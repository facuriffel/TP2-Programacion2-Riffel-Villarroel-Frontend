import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Turno } from '../../core/models/clinica.models';
import { NotificadorService } from '../../core/services/notificador.service';
import { TurnoService } from '../../core/services/turno.service';
import { aIsoFecha, desdeIsoFecha, hoy } from '../../core/utils/fechas';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { TurnosTablaComponent } from '../../shared/components/turnos-tabla/turnos-tabla.component';

@Component({
  selector: 'app-operador-turnos',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    TurnosTablaComponent,
  ],
  template: `
    <section class="pagina-admin">
      <header class="pagina-admin__cabecera">
        <div class="pagina-admin__titulos">
          <h1>Turnos de la sede</h1>
          <p class="pagina-admin__bajada">Turnos de la sede para la fecha seleccionada.</p>
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

          <button mat-button type="button" (click)="volverAHoy()">Hoy</button>
          @if (idMedico() !== null) {
            <span class="filtro-medico">Solo turnos confirmados del médico seleccionado</span>
            <button mat-button type="button" (click)="quitarFiltroMedico()">Ver todos los turnos</button>
          }
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
          <app-turnos-tabla [turnos]="visibles()" [columnas]="columnas" (cancelar)="cancelar($event)" />
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
    .filtro-medico {
      color: #475569;
      font-size: 0.9rem;
    }
  `,
})
export class OperadorTurnosComponent {
  private readonly turnoService = inject(TurnoService);
  private readonly notificador = inject(NotificadorService);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly columnas = ['expandir', 'hora', 'paciente', 'dni', 'medico', 'especialidad', 'estado', 'acciones'];
  readonly turnos = signal<Turno[]>([]);
  readonly cargando = signal(true);
  readonly errorCarga = signal(false);

  private readonly parametros = this.route.snapshot.queryParamMap;
  readonly idMedico = signal<number | null>(
    this.parametros.get('id_medico') ? Number(this.parametros.get('id_medico')) : null,
  );
  readonly visibles = computed(() => {
    const idMedico = this.idMedico();
    if (idMedico === null) return this.turnos();
    return this.turnos().filter((t) => t.id_medico === idMedico && t.estado === 'confirmado');
  });

  readonly filtros = new FormGroup({
    fecha: new FormControl<Date | null>(desdeIsoFecha(this.parametros.get('fecha')) ?? hoy()),
  });

  constructor() {
    this.filtros.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.cargar());
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.errorCarga.set(false);
    this.turnoService
      .listar({ fecha: aIsoFecha(this.filtros.controls.fecha.value) ?? undefined })
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

  quitarFiltroMedico(): void {
    this.idMedico.set(null);
    this.router.navigate([], { queryParams: {}, replaceUrl: true });
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
