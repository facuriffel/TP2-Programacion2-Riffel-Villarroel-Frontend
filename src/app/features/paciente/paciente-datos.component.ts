import { DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Cobertura, Usuario } from '../../core/models/auth.models';
import { AuthService } from '../../core/services/auth.service';
import { CoberturaService } from '../../core/services/cobertura.service';
import { NotificadorService } from '../../core/services/notificador.service';
import { desdeIsoFecha } from '../../core/utils/fechas';

function coincideConContrasena(control: AbstractControl): ValidationErrors | null {
  const contrasena = control.parent?.get('contrasena')?.value;
  return contrasena && control.value !== contrasena ? { noCoincide: true } : null;
}

@Component({
  selector: 'app-paciente-datos',
  standalone: true,
  imports: [
    DatePipe,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <section class="pagina-admin">
      <header class="pagina-admin__cabecera">
        <div class="pagina-admin__titulos">
          <h1>Mis datos personales</h1>
          <p class="pagina-admin__bajada">Información personal y datos modificables.</p>
        </div>
      </header>

      @if (cargando()) {
        <div class="panel-admin">
          <div class="estado-cargando"><mat-spinner diameter="28"></mat-spinner><span>Cargando datos...</span></div>
        </div>
      } @else if (usuario(); as u) {
        <div class="panel-admin contenido">
          <h2>Datos de identificación</h2>
          <dl class="lectura">
            <dt>DNI</dt>
            <dd>{{ u.dni }}</dd>
            <dt>Nombre</dt>
            <dd>{{ u.nombre }}</dd>
            <dt>Apellido</dt>
            <dd>{{ u.apellido }}</dd>
            <dt>Fecha de nacimiento</dt>
            <dd>{{ fechaNacimiento() | date: 'dd/MM/yyyy' }}</dd>
          </dl>

          <h2>Datos modificables</h2>
          <form class="formulario" [formGroup]="form" (ngSubmit)="guardar()">
            <mat-form-field appearance="outline">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" autocomplete="email" />
              @if (form.controls.email.hasError('required')) {
                <mat-error>El email es obligatorio</mat-error>
              } @else if (form.controls.email.hasError('email')) {
                <mat-error>Ingresá un email válido</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Teléfono</mat-label>
              <input matInput formControlName="telefono" inputmode="tel" />
              @if (form.controls.telefono.hasError('pattern')) {
                <mat-error>Ingresá un teléfono válido (solo números, +, - y espacios)</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Cobertura</mat-label>
              <mat-select formControlName="id_cobertura">
                @for (c of coberturas(); track c.id) {
                  <mat-option [value]="c.id">{{ c.nombre }}</mat-option>
                }
              </mat-select>
              @if (form.controls.id_cobertura.hasError('required')) {
                <mat-error>Seleccioná una cobertura</mat-error>
              }
            </mat-form-field>

            <div></div>

            <mat-form-field appearance="outline">
              <mat-label>Nueva contraseña</mat-label>
              <input matInput [type]="ocultarContrasena() ? 'password' : 'text'" formControlName="contrasena" autocomplete="new-password" />
              <button mat-icon-button matSuffix type="button" class="btn-toggle-password"
                [attr.aria-label]="ocultarContrasena() ? 'Mostrar contraseña' : 'Ocultar contraseña'"
                (click)="alternarContrasena()">
                <mat-icon [class.icono-ojo--animado]="animarOjoContrasena()">{{ ocultarContrasena() ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              <mat-hint>Dejala vacía para no cambiarla</mat-hint>
              @if (form.controls.contrasena.hasError('minlength')) {
                <mat-error>Debe tener al menos 6 caracteres</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Repetir nueva contraseña</mat-label>
              <input matInput [type]="ocultarRepetir() ? 'password' : 'text'" formControlName="repetir" autocomplete="new-password" />
              <button mat-icon-button matSuffix type="button" class="btn-toggle-password"
                [attr.aria-label]="ocultarRepetir() ? 'Mostrar contraseña' : 'Ocultar contraseña'"
                (click)="alternarRepetir()">
                <mat-icon [class.icono-ojo--animado]="animarOjoRepetir()">{{ ocultarRepetir() ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              @if (form.controls.repetir.hasError('noCoincide')) {
                <mat-error>Las contraseñas no coinciden</mat-error>
              }
            </mat-form-field>

            <div class="acciones completo">
              <button mat-button type="button" (click)="restablecer()" [disabled]="guardando()">Descartar cambios</button>
              <button mat-flat-button type="submit" [disabled]="guardando()">
                @if (guardando()) {
                  <mat-spinner diameter="18"></mat-spinner>
                } @else {
                  Guardar cambios
                }
              </button>
            </div>
          </form>
        </div>
      }
    </section>
  `,
  styles: `
    .pagina-admin {
      max-width: 800px;
      margin: 0 auto;
      width: 100%;
    }
    .contenido {
      padding: 16px 24px 24px;
      width: 100%;
      box-sizing: border-box;
    }
    h2 {
      margin: 8px 0 12px;
      font: var(--mat-sys-title-medium);
    }
    .lectura {
      display: grid;
      grid-template-columns: 180px 1fr;
      gap: 6px 16px;
      margin: 0 0 20px;
      padding: 12px 16px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
    }
    .lectura dt {
      color: #64748b;
      font-weight: 500;
    }
    .lectura dd {
      margin: 0;
    }
    .formulario {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0 16px;
    }
    .completo {
      grid-column: 1 / -1;
    }
    .acciones {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
    }
  `,
})
export class PacienteDatosComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly coberturaService = inject(CoberturaService);
  private readonly notificador = inject(NotificadorService);
  private readonly destroyRef = inject(DestroyRef);

  alternarContrasena(): void {
    this.ocultarContrasena.update((valor) => !valor);
    this.animarOjoContrasena.set(true);
    setTimeout(() => this.animarOjoContrasena.set(false), 350);
  }

  alternarRepetir(): void {
    this.ocultarRepetir.update((valor) => !valor);
    this.animarOjoRepetir.set(true);
    setTimeout(() => this.animarOjoRepetir.set(false), 350);
  }

  readonly cargando = signal(true);
  readonly guardando = signal(false);
  readonly ocultarContrasena = signal(true);
  readonly ocultarRepetir = signal(true);
  readonly animarOjoContrasena = signal(false);
  readonly animarOjoRepetir = signal(false);
  readonly usuario = signal<Usuario | null>(null);
  readonly coberturas = signal<Cobertura[]>([]);

  readonly form = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    telefono: new FormControl('', { nonNullable: true, validators: [Validators.pattern(/^[0-9+\-\s()]{6,30}$/)] }),
    id_cobertura: new FormControl<number | null>(null, Validators.required),
    contrasena: new FormControl('', { nonNullable: true, validators: [Validators.minLength(6)] }),
    repetir: new FormControl('', { nonNullable: true, validators: [coincideConContrasena] }),
  });

  fechaNacimiento(): Date | null {
    return desdeIsoFecha(this.usuario()?.fecha_nacimiento);
  }

  constructor() {
    this.form.controls.contrasena.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.form.controls.repetir.updateValueAndValidity());
  }

  ngOnInit(): void {
    this.coberturaService
      .listar()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (lista) => this.coberturas.set(lista) });
    this.cargar();
  }

  restablecer(): void {
    const u = this.usuario();
    if (u) this.cargarFormulario(u);
  }

  guardar(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const { email, telefono, id_cobertura, contrasena } = this.form.getRawValue();
    this.guardando.set(true);
    this.authService
      .actualizarPerfil({
        email: email.trim(),
        telefono: telefono.trim() || null,
        id_cobertura,
        ...(contrasena ? { contrasena } : {}),
      })
      .subscribe({
        next: (mensaje) => {
          this.guardando.set(false);
          this.notificador.exito(mensaje);
          this.cargarFormulario(this.authService.currentUser()!);
        },
        error: (err) => {
          this.guardando.set(false);
          this.notificador.errorApi(err, 'No se pudieron guardar los cambios');
        },
      });
  }

  private cargar(): void {
    this.authService
      .getPerfil()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          const usuario = res.datos.usuario;
          this.authService.currentUser.set(usuario);
          this.cargarFormulario(usuario);
          this.cargando.set(false);
        },
        error: (err) => {
          this.cargando.set(false);
          this.notificador.errorApi(err, 'No se pudieron cargar tus datos');
        },
      });
  }

  private cargarFormulario(usuario: Usuario): void {
    this.usuario.set(usuario);
    this.form.reset({
      email: usuario.email,
      telefono: usuario.telefono ?? '',
      id_cobertura: usuario.id_cobertura ?? null,
      contrasena: '',
      repetir: '',
    });
  }
}
