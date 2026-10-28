import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Cobertura, Especialidad, RolUsuario, Sede, UsuarioAdmin, UsuarioPayload } from '../../../core/models/admin.models';
import { UsuarioService } from '../../../core/services/usuario.service';
import { NotificadorService } from '../../../core/services/notificador.service';
import { aIsoFecha, desdeIsoFecha } from '../../../core/utils/fechas';
import { ROLES_ALTA, ROLES_USUARIO } from './usuarios.constantes';

export interface UsuarioDialogData {
  usuario: UsuarioAdmin | null;
  sedes: Sede[];
  especialidades: Especialidad[];
  coberturas: Cobertura[];
}

@Component({
  selector: 'app-usuario-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.usuario ? 'Modificar usuario' : 'Nuevo usuario' }}</h2>
    <form [formGroup]="form" (ngSubmit)="guardar()">
      <mat-dialog-content class="contenido">
        <mat-form-field appearance="outline">
          <mat-label>Tipo de usuario</mat-label>
          <mat-select formControlName="rol">
            @for (rol of rolesDisponibles; track rol.valor) {
              <mat-option [value]="rol.valor">{{ rol.etiqueta }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <div class="fila">
          <mat-form-field appearance="outline">
            <mat-label>Nombre</mat-label>
            <input matInput formControlName="nombre" maxlength="80" />
            @if (form.controls.nombre.hasError('required')) {
              <mat-error>El nombre es obligatorio</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Apellido</mat-label>
            <input matInput formControlName="apellido" maxlength="80" />
            @if (form.controls.apellido.hasError('required')) {
              <mat-error>El apellido es obligatorio</mat-error>
            }
          </mat-form-field>
        </div>

        <div class="fila">
          <mat-form-field appearance="outline">
            <mat-label>DNI</mat-label>
            <input matInput formControlName="dni" maxlength="10" />
            @if (form.controls.dni.hasError('required')) {
              <mat-error>El DNI es obligatorio</mat-error>
            } @else if (form.controls.dni.hasError('pattern')) {
              <mat-error>El DNI debe tener entre 7 y 10 dígitos</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Correo electrónico</mat-label>
            <input matInput type="email" formControlName="email" maxlength="120" />
            @if (form.controls.email.hasError('required')) {
              <mat-error>El correo es obligatorio</mat-error>
            } @else if (form.controls.email.hasError('email')) {
              <mat-error>Ingresá un correo válido</mat-error>
            }
          </mat-form-field>
        </div>

        @if (!data.usuario) {
          <mat-form-field appearance="outline">
            <mat-label>Contraseña</mat-label>
            <input matInput [type]="ocultarPassword() ? 'password' : 'text'" formControlName="password" autocomplete="new-password" />
            <button mat-icon-button matSuffix type="button" class="btn-toggle-password"
              [attr.aria-label]="ocultarPassword() ? 'Mostrar contraseña' : 'Ocultar contraseña'"
              (click)="alternarPassword()">
              <mat-icon [class.icono-ojo--animado]="animarOjo()">{{ ocultarPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
            @if (form.controls.password.hasError('required')) {
              <mat-error>La contraseña es obligatoria</mat-error>
            } @else if (form.controls.password.hasError('minlength')) {
              <mat-error>Debe tener al menos 6 caracteres</mat-error>
            }
          </mat-form-field>
        }

        @if (rol() === 'operador' || rol() === 'medico') {
          <mat-form-field appearance="outline">
            <mat-label>Sede</mat-label>
            <mat-select formControlName="id_sede">
              @for (sede of data.sedes; track sede.id) {
                <mat-option [value]="sede.id">{{ sede.nombre }}</mat-option>
              }
            </mat-select>
            @if (form.controls.id_sede.hasError('required')) {
              <mat-error>La sede es obligatoria</mat-error>
            }
          </mat-form-field>
        }

        @if (rol() === 'medico') {
          <mat-form-field appearance="outline">
            <mat-label>Especialidades</mat-label>
            <mat-select formControlName="especialidades" multiple>
              @for (especialidad of data.especialidades; track especialidad.id) {
                <mat-option [value]="especialidad.id">{{ especialidad.descripcion }}</mat-option>
              }
            </mat-select>
            @if (form.controls.especialidades.hasError('required')) {
              <mat-error>Seleccioná al menos una especialidad</mat-error>
            }
          </mat-form-field>
        }

        @if (rol() === 'paciente') {
          <div class="fila">
            <mat-form-field appearance="outline">
              <mat-label>Fecha de nacimiento</mat-label>
              <input matInput [matDatepicker]="selectorFecha" [max]="hoy" formControlName="fecha_nacimiento" />
              <mat-datepicker-toggle matIconSuffix [for]="selectorFecha"></mat-datepicker-toggle>
              <mat-datepicker #selectorFecha></mat-datepicker>
              @if (form.controls.fecha_nacimiento.hasError('required')) {
                <mat-error>La fecha de nacimiento es obligatoria</mat-error>
              } @else {
                <mat-error>Ingresá una fecha válida</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Cobertura</mat-label>
              <mat-select formControlName="id_cobertura">
                @for (cobertura of data.coberturas; track cobertura.id) {
                  <mat-option [value]="cobertura.id">{{ cobertura.nombre }}</mat-option>
                }
              </mat-select>
              @if (form.controls.id_cobertura.hasError('required')) {
                <mat-error>La cobertura es obligatoria</mat-error>
              }
            </mat-form-field>
          </div>
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
      min-width: min(560px, 100%);
      max-width: 100%;
      box-sizing: border-box;
      padding-top: 8px;
    }
    .fila {
      display: grid;
      grid-template-columns: 1fr 1fr;
      column-gap: 16px;
    }
  `,
})
export class UsuarioDialogComponent {
  readonly data = inject<UsuarioDialogData>(MAT_DIALOG_DATA);
  readonly ocultarPassword = signal(true);
  readonly animarOjo = signal(false);

  alternarPassword(): void {
    this.ocultarPassword.update((valor) => !valor);
    this.animarOjo.set(true);
    setTimeout(() => this.animarOjo.set(false), 350);
  }

  private readonly dialogRef = inject(MatDialogRef<UsuarioDialogComponent, boolean>);
  private readonly usuarioService = inject(UsuarioService);
  private readonly notificador = inject(NotificadorService);

  readonly hoy = new Date();
  readonly guardando = signal(false);
  readonly rolesDisponibles = this.data.usuario?.rol === 'paciente' ? ROLES_USUARIO : ROLES_ALTA;

  readonly form = new FormGroup({
    rol: new FormControl<RolUsuario>(this.data.usuario?.rol ?? 'operador', { nonNullable: true }),
    nombre: new FormControl(this.data.usuario?.nombre ?? '', { nonNullable: true, validators: [Validators.required] }),
    apellido: new FormControl(this.data.usuario?.apellido ?? '', { nonNullable: true, validators: [Validators.required] }),
    dni: new FormControl(this.data.usuario?.dni ?? '', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^\d{7,10}$/)],
    }),
    email: new FormControl(this.data.usuario?.email ?? '', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', { nonNullable: true }),
    id_sede: new FormControl<number | null>(this.data.usuario?.id_sede ?? null),
    especialidades: new FormControl<number[]>(this.data.usuario?.especialidades.map((e) => e.id) ?? [], {
      nonNullable: true,
    }),
    fecha_nacimiento: new FormControl<Date | null>(desdeIsoFecha(this.data.usuario?.fecha_nacimiento)),
    id_cobertura: new FormControl<number | null>(this.data.usuario?.id_cobertura ?? null),
  });

  readonly rol = toSignal(this.form.controls.rol.valueChanges, { initialValue: this.form.controls.rol.value });

  constructor() {
    if (this.data.usuario) {
      this.form.controls.rol.disable();
    } else {
      this.form.controls.password.setValidators([Validators.required, Validators.minLength(6)]);
    }

    this.aplicarReglas(this.form.controls.rol.value);
    this.form.controls.rol.valueChanges.subscribe((rol) => this.aplicarReglas(rol));
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valores = this.form.getRawValue();
    const rol = valores.rol;
    const payload: UsuarioPayload = {
      nombre: valores.nombre.trim(),
      apellido: valores.apellido.trim(),
      dni: valores.dni.trim(),
      email: valores.email.trim(),
      rol,
      id_sede: rol === 'operador' || rol === 'medico' ? valores.id_sede : null,
      especialidades: rol === 'medico' ? valores.especialidades : [],
      fecha_nacimiento: rol === 'paciente' ? aIsoFecha(valores.fecha_nacimiento) : null,
      id_cobertura: rol === 'paciente' ? valores.id_cobertura : null,
    };

    const usuario = this.data.usuario;
    const password = valores.password.trim() || 'Usuario123!';
    const peticion = usuario
      ? this.usuarioService.modificar(usuario.id, payload)
      : this.usuarioService.crear({ ...payload, password });

    this.guardando.set(true);
    peticion.subscribe({
      next: (mensaje) => {
        this.notificador.exito(mensaje);
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.guardando.set(false);
        this.notificador.errorApi(err, 'No se pudo guardar el usuario');
      },
    });
  }

  private aplicarReglas(rol: RolUsuario): void {
    const { id_sede, especialidades, fecha_nacimiento, id_cobertura } = this.form.controls;

    id_sede.setValidators(rol === 'operador' || rol === 'medico' ? [Validators.required] : []);
    especialidades.setValidators(rol === 'medico' ? [Validators.required] : []);
    fecha_nacimiento.setValidators(rol === 'paciente' ? [Validators.required] : []);
    id_cobertura.setValidators(rol === 'paciente' ? [Validators.required] : []);

    for (const control of [id_sede, especialidades, fecha_nacimiento, id_cobertura]) {
      control.updateValueAndValidity({ emitEvent: false });
    }
  }
}
