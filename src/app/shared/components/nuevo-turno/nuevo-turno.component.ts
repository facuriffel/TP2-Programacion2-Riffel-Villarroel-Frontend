import { DatePipe } from '@angular/common';
import { Component, DestroyRef, computed, inject, input, output, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin, map } from 'rxjs';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Cobertura } from '../../../core/models/auth.models';
import { Especialidad, Sede } from '../../../core/models/admin.models';
import { MedicoResumen } from '../../../core/models/clinica.models';
import { AuthService } from '../../../core/services/auth.service';
import { CoberturaService } from '../../../core/services/cobertura.service';
import { ConsultaService } from '../../../core/services/consulta.service';
import { NotificadorService } from '../../../core/services/notificador.service';
import { TurnoService } from '../../../core/services/turno.service';
import { aIsoFecha, hoy } from '../../../core/utils/fechas';

interface MedicoConFechas {
  medico: MedicoResumen;
  fechas: string[];
}

@Component({
  selector: 'app-nuevo-turno',
  standalone: true,
  imports: [
    DatePipe,
    ReactiveFormsModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatChipsModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="panel-admin contenido">
        <mat-stepper linear #stepper>
          <mat-step label="Especialidad" [completed]="especialidadId() !== null">
            <div class="paso">
              @if (cargandoCatalogos()) {
                <div class="estado-cargando"><mat-spinner diameter="24"></mat-spinner><span>Cargando...</span></div>
              } @else {
                <mat-form-field appearance="outline">
                  <mat-label>Especialidad</mat-label>
                  <mat-select [value]="especialidadId()" (selectionChange)="elegirEspecialidad($event.value)">
                    @for (e of especialidades(); track e.id) {
                      <mat-option [value]="e.id">{{ e.descripcion }}</mat-option>
                    } @empty {
                      <mat-option disabled>No hay especialidades disponibles</mat-option>
                    }
                  </mat-select>
                </mat-form-field>
              }
              <div class="acciones">
                <button mat-flat-button type="button" matStepperNext [disabled]="especialidadId() === null">Siguiente</button>
              </div>
            </div>
          </mat-step>

          <mat-step label="Sede y médico" [completed]="medicoId() !== null">
            <div class="paso">
              <mat-form-field appearance="outline">
                <mat-label>Sede</mat-label>
                <mat-select [value]="sedeId()" [disabled]="sedeFija() !== null" (selectionChange)="elegirSede($event.value)">
                  @for (s of sedes(); track s.id) {
                    <mat-option [value]="s.id">{{ s.nombre }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              @if (buscandoMedicos()) {
                <div class="estado-cargando"><mat-spinner diameter="24"></mat-spinner><span>Buscando médicos con agenda...</span></div>
              } @else if (sedeId() !== null) {
                <mat-form-field appearance="outline">
                  <mat-label>Médico</mat-label>
                  <mat-select [value]="medicoId()" (selectionChange)="elegirMedico($event.value)">
                    @for (m of medicosDisponibles(); track m.medico.id) {
                      <mat-option [value]="m.medico.id">{{ m.medico.apellido }}, {{ m.medico.nombre }}</mat-option>
                    } @empty {
                      <mat-option disabled>No hay médicos con agenda en esta sede</mat-option>
                    }
                  </mat-select>
                </mat-form-field>
              }
              <div class="acciones">
                <button mat-button type="button" matStepperPrevious>Atrás</button>
                <button mat-flat-button type="button" matStepperNext [disabled]="medicoId() === null">Siguiente</button>
              </div>
            </div>
          </mat-step>

          <mat-step label="Fecha" [completed]="fecha() !== null">
            <div class="paso">
              <mat-form-field appearance="outline">
                <mat-label>Fecha</mat-label>
                <input
                  matInput
                  readonly
                  [matDatepicker]="selector"
                  [matDatepickerFilter]="filtroFecha"
                  [min]="minimo"
                  [value]="fecha()"
                  (click)="selector.open()"
                  (dateChange)="elegirFecha($event.value)"
                />
                <mat-datepicker-toggle matIconSuffix [for]="selector"></mat-datepicker-toggle>
                <mat-datepicker #selector></mat-datepicker>
                <mat-hint>Solo se habilitan los días con agenda y horarios libres</mat-hint>
              </mat-form-field>
              <div class="acciones">
                <button mat-button type="button" matStepperPrevious>Atrás</button>
                <button mat-flat-button type="button" matStepperNext [disabled]="fecha() === null">Siguiente</button>
              </div>
            </div>
          </mat-step>

          <mat-step label="Horario" [completed]="hora() !== null">
            <div class="paso">
              @if (cargandoHorarios()) {
                <div class="estado-cargando"><mat-spinner diameter="24"></mat-spinner><span>Buscando horarios libres...</span></div>
              } @else if (horarios().length === 0) {
                <p class="aviso">No quedan horarios libres para esa fecha. Volvé al paso anterior y elegí otra.</p>
              } @else {
                <mat-chip-listbox aria-label="Horario disponible" [value]="hora()" (change)="hora.set($event.value ?? null)">
                  @for (h of horarios(); track h) {
                    <mat-chip-option [value]="h">{{ h }}</mat-chip-option>
                  }
                </mat-chip-listbox>
              }
              <div class="acciones">
                <button mat-button type="button" matStepperPrevious>Atrás</button>
                <button mat-flat-button type="button" matStepperNext [disabled]="hora() === null">Siguiente</button>
              </div>
            </div>
          </mat-step>

          <mat-step label="Confirmación">
            <div class="paso">
              <mat-form-field appearance="outline">
                <mat-label>Nota para el médico</mat-label>
                <textarea matInput rows="3" [formControl]="nota"></textarea>
                @if (nota.hasError('required') || nota.hasError('pattern')) {
                  <mat-error>La nota es obligatoria</mat-error>
                }
              </mat-form-field>

              <dl class="resumen">
                <dt>Especialidad</dt>
                <dd>{{ nombreEspecialidad() }}</dd>
                <dt>Médico</dt>
                <dd>{{ nombreMedico() }}</dd>
                <dt>Sede</dt>
                <dd>{{ nombreSede() }}</dd>
                <dt>Fecha</dt>
                <dd>{{ fecha() | date: 'dd/MM/yyyy' }}</dd>
                <dt>Hora</dt>
                <dd>{{ hora() }}</dd>
                <dt>Cobertura</dt>
                <dd>{{ cobertura() }}</dd>
              </dl>

              <div class="acciones">
                <button mat-button type="button" matStepperPrevious [disabled]="guardando()">Atrás</button>
                <button mat-flat-button type="button" (click)="confirmar()" [disabled]="guardando()">
                  @if (guardando()) {
                    <mat-spinner diameter="18"></mat-spinner>
                  } @else {
                    Confirmar turno
                  }
                </button>
              </div>
            </div>
          </mat-step>
        </mat-stepper>
    </div>
  `,
  styles: `
    .contenido {
      padding: 8px 16px 16px;
      width: 100%;
      box-sizing: border-box;
    }
    .paso {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding-top: 16px;
      max-width: 520px;
    }
    .acciones {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
      margin-top: 8px;
    }
    .aviso {
      margin: 0;
      color: #475569;
    }
    .resumen {
      display: grid;
      grid-template-columns: 140px 1fr;
      gap: 6px 16px;
      margin: 8px 0;
      padding: 12px 16px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
    }
    .resumen dt {
      color: #64748b;
      font-weight: 500;
    }
    .resumen dd {
      margin: 0;
    }
  `,
})
/** Stepper de solicitud de turno; lo usan el paciente (para sí) y el operador (para un paciente, con sede fija). */
export class NuevoTurnoComponent {
  private readonly authService = inject(AuthService);
  private readonly consultaService = inject(ConsultaService);
  private readonly coberturaService = inject(CoberturaService);
  private readonly turnoService = inject(TurnoService);
  private readonly notificador = inject(NotificadorService);
  private readonly destroyRef = inject(DestroyRef);

  /** Si se informa, la sede queda fija (operador). */
  readonly sedeFija = input<number | null>(null);
  /** Si se informa, el turno se asigna a ese paciente (operador). */
  readonly idPaciente = input<number | null>(null);
  /** Cobertura que se muestra en el resumen; por defecto la del usuario logueado. */
  readonly idCobertura = input<number | null>(null);
  readonly creado = output<string>();

  private readonly stepper = viewChild.required(MatStepper);

  readonly minimo = hoy();

  readonly especialidades = signal<Especialidad[]>([]);
  readonly sedes = signal<Sede[]>([]);
  private readonly coberturas = signal<Cobertura[]>([]);
  readonly cobertura = computed(() => {
    const id = this.idCobertura() ?? this.authService.currentUser()?.id_cobertura;
    return this.coberturas().find((c) => c.id === id)?.nombre ?? 'Sin cobertura registrada';
  });
  readonly cargandoCatalogos = signal(true);

  readonly especialidadId = signal<number | null>(null);
  readonly sedeId = signal<number | null>(null);
  readonly medicoId = signal<number | null>(null);
  readonly fecha = signal<Date | null>(null);
  readonly hora = signal<string | null>(null);

  private readonly medicosPorEspecialidad = signal<MedicoResumen[]>([]);
  readonly medicosDisponibles = signal<MedicoConFechas[]>([]);
  readonly horarios = signal<string[]>([]);
  readonly buscandoMedicos = signal(false);
  readonly cargandoHorarios = signal(false);
  readonly guardando = signal(false);

  readonly nota = new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/\S/)] });

  private readonly fechasHabilitadas = computed(
    () => new Set(this.medicosDisponibles().find((m) => m.medico.id === this.medicoId())?.fechas ?? []),
  );

  readonly nombreEspecialidad = computed(
    () => this.especialidades().find((e) => e.id === this.especialidadId())?.descripcion ?? '',
  );
  readonly nombreSede = computed(() => this.sedes().find((s) => s.id === this.sedeId())?.nombre ?? '');
  readonly nombreMedico = computed(() => {
    const medico = this.medicosDisponibles().find((m) => m.medico.id === this.medicoId())?.medico;
    return medico ? `${medico.apellido}, ${medico.nombre}` : '';
  });

  readonly filtroFecha = (fecha: Date | null): boolean => !!fecha && this.fechasHabilitadas().has(aIsoFecha(fecha)!);

  constructor() {
    forkJoin({
      especialidades: this.consultaService.especialidades(),
      sedes: this.consultaService.sedes(),
      coberturas: this.coberturaService.listar(),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ especialidades, sedes, coberturas }) => {
          this.especialidades.set(especialidades);
          this.sedes.set(sedes);
          this.coberturas.set(coberturas);
          this.cargandoCatalogos.set(false);
        },
        error: (err) => {
          this.cargandoCatalogos.set(false);
          this.notificador.errorApi(err, 'No se pudieron cargar los datos para solicitar el turno');
        },
      });
  }

  elegirEspecialidad(id: number): void {
    const sedeFija = this.sedeFija();
    this.especialidadId.set(id);
    this.sedeId.set(sedeFija);
    this.reiniciarDesdeMedico();
    this.medicosPorEspecialidad.set([]);
    if (sedeFija !== null) this.buscandoMedicos.set(true);
    this.consultaService
      .medicos({ id_especialidad: id })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (medicos) => {
          this.medicosPorEspecialidad.set(medicos);
          if (sedeFija !== null) this.elegirSede(sedeFija);
        },
        error: (err) => {
          this.buscandoMedicos.set(false);
          this.notificador.errorApi(err, 'No se pudieron cargar los médicos');
        },
      });
  }

  /** Un médico puede atender en varias sedes: se conservan solo los que tienen fechas libres en la sede elegida. */
  elegirSede(id: number): void {
    this.sedeId.set(id);
    this.reiniciarDesdeMedico();
    const medicos = this.medicosPorEspecialidad();
    if (medicos.length === 0) {
      this.buscandoMedicos.set(false);
      return;
    }

    this.buscandoMedicos.set(true);
    forkJoin(
      medicos.map((medico) =>
        this.turnoService
          .fechasDisponibles({ id_medico: medico.id, id_sede: id, id_especialidad: this.especialidadId()! })
          .pipe(map((fechas) => ({ medico, fechas }))),
      ),
    )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (lista) => {
          this.medicosDisponibles.set(lista.filter((m) => m.fechas.length > 0));
          this.buscandoMedicos.set(false);
        },
        error: (err) => {
          this.buscandoMedicos.set(false);
          this.notificador.errorApi(err, 'No se pudo consultar la agenda de los médicos');
        },
      });
  }

  elegirMedico(id: number): void {
    this.medicoId.set(id);
    this.fecha.set(null);
    this.limpiarHorario();
  }

  elegirFecha(fecha: Date | null): void {
    this.fecha.set(fecha);
    this.cargarHorarios();
  }

  private reiniciarDesdeMedico(): void {
    this.medicosDisponibles.set([]);
    this.medicoId.set(null);
    this.fecha.set(null);
    this.limpiarHorario();
  }

  private limpiarHorario(): void {
    this.hora.set(null);
    this.horarios.set([]);
  }

  private cargarHorarios(): void {
    this.limpiarHorario();
    const fecha = aIsoFecha(this.fecha());
    if (!fecha) return;

    this.cargandoHorarios.set(true);
    this.turnoService
      .horariosLibres({
        id_medico: this.medicoId()!,
        id_sede: this.sedeId()!,
        id_especialidad: this.especialidadId()!,
        fecha,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (horarios) => {
          this.horarios.set(horarios);
          this.cargandoHorarios.set(false);
        },
        error: (err) => {
          this.cargandoHorarios.set(false);
          this.notificador.errorApi(err, 'No se pudieron consultar los horarios');
        },
      });
  }

  confirmar(): void {
    this.nota.markAsTouched();
    if (this.nota.invalid) return;

    this.guardando.set(true);
    this.turnoService
      .crear({
        id_especialidad: this.especialidadId()!,
        id_sede: this.sedeId()!,
        id_medico: this.medicoId()!,
        fecha: aIsoFecha(this.fecha())!,
        hora: this.hora()!,
        nota: this.nota.value.trim(),
        ...(this.idPaciente() !== null ? { id_paciente_body: this.idPaciente()! } : {}),
      })
      .subscribe({
        next: (mensaje) => {
          this.guardando.set(false);
          this.notificador.exito(mensaje);
          this.creado.emit(mensaje);
        },
        error: (err) => {
          this.guardando.set(false);
          this.notificador.errorApi(err, 'No se pudo reservar el turno. Elegí otro horario e intentá nuevamente.');
          this.volverAElegirHorario();
        },
      });
  }

  /** Ante un rechazo (p. ej. horario ocupado) se conserva lo elegido y solo se vuelve al paso del horario. */
  private volverAElegirHorario(): void {
    this.cargarHorarios();
    this.stepper().selectedIndex = 3;
  }
}
