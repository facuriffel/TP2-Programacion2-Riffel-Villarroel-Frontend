import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Especialidad, Sede } from '../../../core/models/admin.models';
import { AgendaItem, MedicoResumen } from '../../../core/models/clinica.models';
import { AgendaService } from '../../../core/services/agenda.service';
import { NotificadorService } from '../../../core/services/notificador.service';
import { aIsoFecha, desdeIsoFecha, hoy } from '../../../core/utils/fechas';

export interface AgendaDialogData {
  agenda: AgendaItem | null;
  medicos: MedicoResumen[];
  sedes: Sede[];
  /** Si se informa, el médico queda fijo (rol médico). */
  idMedicoFijo?: number;
  /** Si se informa, la sede queda fija (rol operador). */
  idSedeFija?: number;
}

function rangoHorarioValido(grupo: AbstractControl): ValidationErrors | null {
  const entrada = grupo.get('hora_entrada')?.value as string;
  const salida = grupo.get('hora_salida')?.value as string;
  return entrada && salida && salida <= entrada ? { rangoInvalido: true } : null;
}

@Component({
  selector: 'app-agenda-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.agenda ? 'Modificar' : 'Nueva' }} agenda</h2>
    <form [formGroup]="form" (ngSubmit)="guardar()">
      <mat-dialog-content class="contenido">
        <mat-form-field appearance="outline">
          <mat-label>Médico</mat-label>
          <mat-select formControlName="id_medico">
            @for (medico of data.medicos; track medico.id) {
              <mat-option [value]="medico.id">{{ medico.apellido }}, {{ medico.nombre }}</mat-option>
            }
          </mat-select>
          @if (form.controls.id_medico.hasError('required')) {
            <mat-error>Seleccioná un médico</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Especialidad</mat-label>
          <mat-select formControlName="id_especialidad">
            @for (especialidad of especialidades(); track especialidad.id) {
              <mat-option [value]="especialidad.id">{{ especialidad.descripcion }}</mat-option>
            }
          </mat-select>
          @if (form.controls.id_especialidad.hasError('required')) {
            <mat-error>Seleccioná una especialidad</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Sede</mat-label>
          <mat-select formControlName="id_sede">
            @for (sede of data.sedes; track sede.id) {
              <mat-option [value]="sede.id">{{ sede.nombre }}</mat-option>
            }
          </mat-select>
          @if (form.controls.id_sede.hasError('required')) {
            <mat-error>Seleccioná una sede</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Fecha</mat-label>
          <input matInput [matDatepicker]="selector" [min]="minimo" formControlName="fecha" />
          <mat-datepicker-toggle matIconSuffix [for]="selector"></mat-datepicker-toggle>
          <mat-datepicker #selector></mat-datepicker>
          @if (form.controls.fecha.hasError('required') || form.controls.fecha.hasError('matDatepickerParse')) {
            <mat-error>Ingresá una fecha válida</mat-error>
          } @else if (form.controls.fecha.hasError('matDatepickerMin')) {
            <mat-error>La fecha no puede ser anterior a hoy</mat-error>
          }
        </mat-form-field>

        <div class="fila">
          <mat-form-field appearance="outline">
            <mat-label>Hora de entrada</mat-label>
            <input matInput type="time" formControlName="hora_entrada" />
            @if (form.controls.hora_entrada.hasError('required')) {
              <mat-error>Obligatoria</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Hora de salida</mat-label>
            <input matInput type="time" formControlName="hora_salida" />
            @if (form.controls.hora_salida.hasError('required')) {
              <mat-error>Obligatoria</mat-error>
            }
          </mat-form-field>
        </div>

        @if (form.hasError('rangoInvalido') && form.controls.hora_salida.touched) {
          <p class="error-rango">La hora de salida debe ser posterior a la hora de entrada.</p>
        }
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button type="button" mat-dialog-close [disabled]="guardando()">Cancelar</button>
        <button mat-flat-button type="submit" [disabled]="guardando()">
          @if (guardando()) {
            <mat-spinner diameter="18"></mat-spinner>
          } @else {
            Guardar
          }
        </button>
      </mat-dialog-actions>
    </form>
  `,
  styles: `
    .contenido {
      display: flex;
      flex-direction: column;
      min-width: min(400px, 100%);
      max-width: 100%;
      box-sizing: border-box;
      padding-top: 8px;
    }
    .fila {
      display: flex;
      gap: 12px;
    }
    .fila mat-form-field {
      flex: 1;
    }
    .error-rango {
      margin: 0 0 8px;
      color: var(--mat-sys-error, #b3261e);
      font-size: 0.85rem;
    }
  `,
})
export class AgendaDialogComponent {
  readonly data = inject<AgendaDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<AgendaDialogComponent, boolean>);
  private readonly agendaService = inject(AgendaService);
  private readonly notificador = inject(NotificadorService);
  private readonly destroyRef = inject(DestroyRef);

  readonly guardando = signal(false);
  readonly especialidades = signal<Especialidad[]>([]);
  readonly minimo = this.data.agenda ? null : hoy();

  readonly form = new FormGroup(
    {
      id_medico: new FormControl<number | null>(null, Validators.required),
      id_especialidad: new FormControl<number | null>(null, Validators.required),
      id_sede: new FormControl<number | null>(null, Validators.required),
      fecha: new FormControl<Date | null>(null, Validators.required),
      hora_entrada: new FormControl('', { nonNullable: true, validators: Validators.required }),
      hora_salida: new FormControl('', { nonNullable: true, validators: Validators.required }),
    },
    { validators: rangoHorarioValido },
  );

  constructor() {
    const { agenda, idMedicoFijo, idSedeFija } = this.data;

    this.form.controls.id_medico.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((id) => this.actualizarEspecialidades(id));

    this.form.patchValue({
      id_medico: agenda?.id_medico ?? idMedicoFijo ?? null,
      id_sede: agenda?.id_sede ?? idSedeFija ?? null,
      fecha: desdeIsoFecha(agenda?.fecha),
      hora_entrada: agenda?.hora_entrada ?? '',
      hora_salida: agenda?.hora_salida ?? '',
    });
    this.actualizarEspecialidades(this.form.controls.id_medico.value, agenda?.id_especialidad);

    if (idMedicoFijo) this.form.controls.id_medico.disable();
    if (idSedeFija) this.form.controls.id_sede.disable();
  }

  private actualizarEspecialidades(idMedico: number | null, preseleccion?: number): void {
    const lista = this.data.medicos.find((m) => m.id === idMedico)?.especialidades ?? [];
    this.especialidades.set(lista);

    const actual = preseleccion ?? this.form.controls.id_especialidad.value;
    const valida = lista.some((e) => e.id === actual);
    this.form.controls.id_especialidad.setValue(valida ? actual : lista.length === 1 ? lista[0].id : null);
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valores = this.form.getRawValue();
    const datos = {
      id_medico: valores.id_medico!,
      id_especialidad: valores.id_especialidad!,
      id_sede: valores.id_sede!,
      fecha: aIsoFecha(valores.fecha)!,
      hora_entrada: valores.hora_entrada,
      hora_salida: valores.hora_salida,
    };

    const peticion = this.data.agenda
      ? this.agendaService.modificar(this.data.agenda.id, datos)
      : this.agendaService.crear(datos);

    this.guardando.set(true);
    peticion.subscribe({
      next: (mensaje) => {
        this.notificador.exito(mensaje);
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.guardando.set(false);
        this.notificador.errorApi(err, 'No se pudo guardar la agenda');
      },
    });
  }
}
