import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PacienteResumen } from '../../core/models/clinica.models';
import { AuthService } from '../../core/services/auth.service';
import { ConsultaService } from '../../core/services/consulta.service';
import { NotificadorService } from '../../core/services/notificador.service';
import { NuevoTurnoComponent } from '../../shared/components/nuevo-turno/nuevo-turno.component';

@Component({
  selector: 'app-operador-asignar-turno',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    NuevoTurnoComponent,
  ],
  template: `
    <section class="pagina-admin">
      <header class="pagina-admin__cabecera">
        <div class="pagina-admin__titulos">
          <h1>Asignar turno</h1>
          <p class="pagina-admin__bajada">Asigná un turno a un paciente en {{ nombreSede() }}.</p>
        </div>
      </header>

      <div class="panel-admin contenido">
        <h2>1. Paciente</h2>
        <form class="fila" [formGroup]="busqueda" (ngSubmit)="buscarPaciente()">
          <mat-form-field appearance="outline" subscriptSizing="dynamic">
            <mat-label>DNI</mat-label>
            <input matInput formControlName="dni" inputmode="numeric" />
          </mat-form-field>
          <mat-form-field appearance="outline" subscriptSizing="dynamic">
            <mat-label>Apellido</mat-label>
            <input matInput formControlName="apellido" />
          </mat-form-field>
          <button mat-stroked-button type="submit" [disabled]="buscando()">Buscar</button>
        </form>

        @if (buscando()) {
          <div class="estado-cargando">
            <mat-spinner diameter="24"></mat-spinner>
            <span>Buscando pacientes...</span>
          </div>
        } @else if (pacientes() !== null) {
          @if (pacientes()!.length === 0) {
            <p class="aviso">No se encontraron registros. Podés dar de alta al paciente desde "Alta de pacientes".</p>
          } @else {
            <mat-form-field appearance="outline" subscriptSizing="dynamic" class="ancho">
              <mat-label>Resultados</mat-label>
              <mat-select [formControl]="paciente">
                @for (p of pacientes(); track p.id) {
                  <mat-option [value]="p">{{ p.apellido }}, {{ p.nombre }} · DNI {{ p.dni }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
          }
        }
      </div>

      @if (paciente.value; as seleccionado) {
        <h2 class="titulo-turno">2. Turno para {{ seleccionado.apellido }}, {{ seleccionado.nombre }} en {{ nombreSede() }}</h2>
        <app-nuevo-turno
          [sedeFija]="idSede"
          [idPaciente]="seleccionado.id"
          [idCobertura]="seleccionado.id_cobertura"
          (creado)="reiniciar()"
        />
      }
    </section>
  `,
  styles: `
    .contenido {
      padding: 16px 24px 24px;
      max-width: 760px;
    }
    h2 {
      margin: 16px 0 12px;
      font: var(--mat-sys-title-medium);
    }
    .titulo-turno {
      margin: 24px 0 12px;
    }
    .fila {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      align-items: center;
    }
    .fila mat-form-field {
      width: 200px;
    }
    .ancho {
      width: 100%;
      margin-top: 12px;
    }
    .aviso {
      margin: 12px 0 0;
      color: #475569;
    }
    app-nuevo-turno {
      display: block;
      max-width: 900px;
    }
  `,
})
export class OperadorAsignarTurnoComponent {
  private readonly authService = inject(AuthService);
  private readonly consultaService = inject(ConsultaService);
  private readonly notificador = inject(NotificadorService);
  private readonly destroyRef = inject(DestroyRef);

  readonly idSede = this.authService.currentUser()?.id_sede ?? 0;

  readonly nombreSede = signal('tu sede');
  readonly pacientes = signal<PacienteResumen[] | null>(null);
  readonly buscando = signal(false);

  readonly busqueda = new FormGroup({
    dni: new FormControl('', { nonNullable: true }),
    apellido: new FormControl('', { nonNullable: true }),
  });
  readonly paciente = new FormControl<PacienteResumen | null>(null, Validators.required);

  constructor() {
    this.consultaService
      .sedes()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (sedes) => this.nombreSede.set(sedes.find((s) => s.id === this.idSede)?.nombre ?? 'tu sede') });
  }

  buscarPaciente(): void {
    const dni = this.busqueda.controls.dni.value.trim();
    const apellido = this.busqueda.controls.apellido.value.trim();
    if (!dni && !apellido) {
      this.notificador.error('Ingresá un DNI o un apellido para buscar.');
      return;
    }

    this.buscando.set(true);
    this.paciente.reset(null);
    this.consultaService.pacientes({ dni, apellido }).subscribe({
      next: (pacientes) => {
        this.pacientes.set(pacientes);
        if (pacientes.length === 1) this.paciente.setValue(pacientes[0]);
        this.buscando.set(false);
      },
      error: (err) => {
        this.buscando.set(false);
        this.notificador.errorApi(err, 'No se pudo realizar la búsqueda');
      },
    });
  }

  /** Tras asignar el turno se vuelve a la búsqueda para atender al siguiente paciente. */
  reiniciar(): void {
    this.paciente.reset(null);
    this.pacientes.set(null);
    this.busqueda.reset({ dni: '', apellido: '' });
  }
}
