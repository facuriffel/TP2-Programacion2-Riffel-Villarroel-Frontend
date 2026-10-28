import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
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
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Turno } from '../../core/models/clinica.models';
import { NotificadorService } from '../../core/services/notificador.service';
import { TurnoService } from '../../core/services/turno.service';

@Component({
  selector: 'app-atender-dialog',
  standalone: true,
  imports: [
    DatePipe,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <h2 mat-dialog-title>Marcar como atendido</h2>
    <form [formGroup]="form" (ngSubmit)="guardar()">
      <mat-dialog-content class="contenido">
        <p class="resumen">
          {{ turno.paciente_apellido }}, {{ turno.paciente_nombre }} · {{ turno.fecha | date: 'dd/MM/yyyy' }}
          {{ turno.hora }}
        </p>

        <mat-form-field appearance="outline">
          <mat-label>Diagnóstico</mat-label>
          <textarea matInput rows="3" formControlName="diagnostico"></textarea>
          @if (form.controls.diagnostico.hasError('required')) {
            <mat-error>El diagnóstico es obligatorio</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Tratamiento</mat-label>
          <textarea matInput rows="3" formControlName="tratamiento"></textarea>
          @if (form.controls.tratamiento.hasError('required')) {
            <mat-error>El tratamiento es obligatorio</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Observaciones</mat-label>
          <textarea matInput rows="2" formControlName="observaciones"></textarea>
        </mat-form-field>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button type="button" mat-dialog-close [disabled]="guardando()">Cancelar</button>
        <button mat-flat-button type="submit" [disabled]="guardando()">
          @if (guardando()) {
            <mat-spinner diameter="18"></mat-spinner>
          } @else {
            Registrar atención
          }
        </button>
      </mat-dialog-actions>
    </form>
  `,
  styles: `
    .contenido {
      display: flex;
      flex-direction: column;
      width: 100%;
      box-sizing: border-box;
      padding-top: 8px;
    }
    .resumen {
      margin: 0 0 16px;
      color: #475569;
    }
  `,
})
export class AtenderDialogComponent {
  readonly turno = inject<Turno>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<AtenderDialogComponent, boolean>);
  private readonly turnoService = inject(TurnoService);
  private readonly notificador = inject(NotificadorService);

  readonly guardando = signal(false);
  readonly form = new FormGroup({
    diagnostico: new FormControl('', { nonNullable: true, validators: [Validators.required, noVacio] }),
    tratamiento: new FormControl('', { nonNullable: true, validators: [Validators.required, noVacio] }),
    observaciones: new FormControl('', { nonNullable: true }),
  });

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    this.turnoService.atender(this.turno.id, this.form.getRawValue()).subscribe({
      next: (mensaje) => {
        this.notificador.exito(mensaje);
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.guardando.set(false);
        this.notificador.errorApi(err, 'No se pudo registrar la atención');
      },
    });
  }
}

function noVacio(control: AbstractControl): ValidationErrors | null {
  return control.value.trim() ? null : { required: true };
}
