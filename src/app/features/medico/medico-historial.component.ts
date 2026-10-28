import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PacienteResumen, RegistroHistorial } from '../../core/models/clinica.models';
import { ConsultaService } from '../../core/services/consulta.service';
import { HistorialService } from '../../core/services/historial.service';
import { NotificadorService } from '../../core/services/notificador.service';

@Component({
  selector: 'app-medico-historial',
  standalone: true,
  imports: [
    DatePipe,
    ReactiveFormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <section class="pagina-admin">
      <header class="pagina-admin__cabecera">
        <div class="pagina-admin__titulos">
          <h1>Historial clínico</h1>
          <p class="pagina-admin__bajada">Historial clínico de los pacientes que atendiste.</p>
        </div>
      </header>

      <div class="panel-admin">
        <form class="filtros" [formGroup]="filtros" (ngSubmit)="buscar()">
          <mat-form-field appearance="outline" subscriptSizing="dynamic">
            <mat-label>DNI</mat-label>
            <input matInput formControlName="dni" inputmode="numeric" />
          </mat-form-field>

          <mat-form-field appearance="outline" subscriptSizing="dynamic">
            <mat-label>Apellido</mat-label>
            <input matInput formControlName="apellido" />
          </mat-form-field>

          <button mat-flat-button type="submit" [disabled]="buscando()">Buscar paciente</button>
        </form>

        @if (buscando()) {
          <div class="estado-cargando">
            <mat-spinner diameter="28"></mat-spinner>
            <span>Buscando pacientes...</span>
          </div>
        } @else if (pacientes() === null) {
          <div class="estado-vacio">Ingresá un DNI o un apellido para buscar pacientes.</div>
        } @else if (pacientes()!.length === 0) {
          <div class="estado-vacio">No se encontraron registros</div>
        } @else {
          <div class="table-container">
          <table mat-table [dataSource]="pacientes()!" class="tabla-admin">
            <ng-container matColumnDef="paciente">
              <th mat-header-cell *matHeaderCellDef>Paciente</th>
              <td mat-cell *matCellDef="let paciente">{{ paciente.apellido }}, {{ paciente.nombre }}</td>
            </ng-container>

            <ng-container matColumnDef="dni">
              <th mat-header-cell *matHeaderCellDef>DNI</th>
              <td mat-cell *matCellDef="let paciente">{{ paciente.dni }}</td>
            </ng-container>

            <ng-container matColumnDef="acciones">
              <th mat-header-cell *matHeaderCellDef class="columna-acciones"></th>
              <td mat-cell *matCellDef="let paciente" class="columna-acciones">
                <button mat-button type="button" (click)="verHistorial(paciente)">Ver historial</button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="columnas"></tr>
            <tr mat-row *matRowDef="let fila; columns: columnas" [class.seleccionado]="fila.id === seleccionado()?.id"></tr>
          </table>
          </div>
        }
      </div>

      @if (seleccionado(); as paciente) {
        <div class="panel-admin historial">
          <h2>{{ paciente.apellido }}, {{ paciente.nombre }} · DNI {{ paciente.dni }}</h2>

          @if (cargandoHistorial()) {
            <div class="estado-cargando">
              <mat-spinner diameter="28"></mat-spinner>
              <span>Cargando historial...</span>
            </div>
          } @else if (registros().length === 0) {
            <div class="estado-vacio">No se encontraron registros</div>
          } @else {
            <mat-accordion multi>
              @for (registro of registros(); track registro.id) {
                <mat-expansion-panel>
                  <mat-expansion-panel-header>
                    <mat-panel-title>{{ registro.fecha_turno | date: 'dd/MM/yyyy' }} · {{ registro.hora_turno }}</mat-panel-title>
                    <mat-panel-description>{{ registro.especialidad }}</mat-panel-description>
                  </mat-expansion-panel-header>
                  <dl class="detalle">
                    <dt>Diagnóstico</dt>
                    <dd>{{ registro.diagnostico }}</dd>
                    <dt>Tratamiento</dt>
                    <dd>{{ registro.tratamiento }}</dd>
                    <dt>Observaciones</dt>
                    <dd>{{ registro.observaciones || 'Sin observaciones' }}</dd>
                  </dl>
                </mat-expansion-panel>
              }
            </mat-accordion>
          }
        </div>
      }
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
    .historial {
      margin-top: 16px;
      padding: 16px;
    }
    .historial h2 {
      margin: 0 0 12px;
      font: var(--mat-sys-title-medium);
    }
    .seleccionado {
      background: #f1f5f9;
    }
    .detalle {
      margin: 0;
    }
    .detalle dt {
      font-weight: 500;
      color: #475569;
    }
    .detalle dd {
      margin: 2px 0 12px;
      white-space: pre-wrap;
    }
  `,
})
export class MedicoHistorialComponent {
  private readonly consultaService = inject(ConsultaService);
  private readonly historialService = inject(HistorialService);
  private readonly notificador = inject(NotificadorService);

  readonly columnas = ['paciente', 'dni', 'acciones'];
  readonly pacientes = signal<PacienteResumen[] | null>(null);
  readonly seleccionado = signal<PacienteResumen | null>(null);
  readonly registros = signal<RegistroHistorial[]>([]);
  readonly buscando = signal(false);
  readonly cargandoHistorial = signal(false);

  readonly filtros = new FormGroup({
    dni: new FormControl('', { nonNullable: true }),
    apellido: new FormControl('', { nonNullable: true }),
  });

  buscar(): void {
    const dni = this.filtros.controls.dni.value.trim();
    const apellido = this.filtros.controls.apellido.value.trim();
    if (!dni && !apellido) {
      this.notificador.error('Ingresá un DNI o un apellido para buscar.');
      return;
    }

    this.buscando.set(true);
    this.seleccionado.set(null);
    this.consultaService.pacientes({ dni, apellido }).subscribe({
      next: (pacientes) => {
        this.pacientes.set(pacientes);
        this.buscando.set(false);
      },
      error: (err) => {
        this.buscando.set(false);
        this.notificador.errorApi(err, 'No se pudo realizar la búsqueda');
      },
    });
  }

  verHistorial(paciente: PacienteResumen): void {
    this.seleccionado.set(paciente);
    this.registros.set([]);
    this.cargandoHistorial.set(true);
    this.historialService.porPaciente(paciente.id).subscribe({
      next: (registros) => {
        this.registros.set(registros);
        this.cargandoHistorial.set(false);
      },
      error: (err) => {
        this.cargandoHistorial.set(false);
        this.notificador.errorApi(err, 'No se pudo cargar el historial');
      },
    });
  }
}
