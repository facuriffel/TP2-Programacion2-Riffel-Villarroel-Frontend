import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NotificadorService } from '../../../core/services/notificador.service';
import { CatalogoConfig, RegistroCatalogo, valorDeCampo } from './catalogo.config';

export interface CatalogoDialogData {
  config: CatalogoConfig;
  registro: RegistroCatalogo | null;
}

@Component({
  selector: 'app-catalogo-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.registro ? 'Modificar' : 'Nueva' }} {{ data.config.entidad }}</h2>
    <form [formGroup]="form" (ngSubmit)="guardar()">
      <mat-dialog-content class="contenido">
        @for (campo of data.config.campos; track campo.clave) {
          <mat-form-field appearance="outline">
            <mat-label>{{ campo.etiqueta }}</mat-label>
            <input matInput [formControlName]="campo.clave" [maxlength]="campo.maxLength" />
            @if (form.controls[campo.clave].hasError('required')) {
              <mat-error>{{ campo.etiqueta }} es obligatorio</mat-error>
            } @else if (form.controls[campo.clave].hasError('pattern')) {
              <mat-error>{{ campo.mensajePatron }}</mat-error>
            }
          </mat-form-field>
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
      min-width: 380px;
      max-width: 100%;
      box-sizing: border-box;
      padding-top: 8px;
    }
  `,
})
export class CatalogoDialogComponent {
  readonly data = inject<CatalogoDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<CatalogoDialogComponent, boolean>);
  private readonly notificador = inject(NotificadorService);
  private readonly api = inject(this.data.config.servicio);

  readonly guardando = signal(false);
  readonly form = new FormGroup<Record<string, FormControl<string>>>({});

  constructor() {
    for (const campo of this.data.config.campos) {
      const validadores = [Validators.required];
      if (campo.patron) validadores.push(Validators.pattern(campo.patron));
      const inicial = this.data.registro ? valorDeCampo(this.data.registro, campo.clave) : '';
      this.form.addControl(campo.clave, new FormControl(inicial, { nonNullable: true, validators: validadores }));
    }
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const datos = Object.fromEntries(
      Object.entries(this.form.getRawValue()).map(([clave, valor]) => [clave, valor.trim()]),
    ) as Omit<RegistroCatalogo, 'id'>;

    const peticion = this.data.registro
      ? this.api.modificar(this.data.registro.id, datos)
      : this.api.crear(datos);

    this.guardando.set(true);
    peticion.subscribe({
      next: (mensaje) => {
        this.notificador.exito(mensaje);
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.guardando.set(false);
        this.notificador.errorApi(err, 'No se pudo guardar el registro');
      },
    });
  }
}
