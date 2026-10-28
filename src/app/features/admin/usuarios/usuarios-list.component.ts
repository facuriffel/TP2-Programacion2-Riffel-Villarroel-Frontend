import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EMPTY, Subject, catchError, debounceTime, forkJoin, of, switchMap, tap } from 'rxjs';
import { Cobertura, Especialidad, Sede, UsuarioAdmin } from '../../../core/models/admin.models';
import { CoberturaService } from '../../../core/services/cobertura.service';
import { EspecialidadService } from '../../../core/services/especialidad.service';
import { SedeService } from '../../../core/services/sede.service';
import { UsuarioService } from '../../../core/services/usuario.service';
import { NotificadorService } from '../../../core/services/notificador.service';
import { UsuarioDialogComponent } from './usuario-dialog.component';
import { ROLES_USUARIO, etiquetaRol } from './usuarios.constantes';

@Component({
  selector: 'app-usuarios-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  template: `
    <section class="pagina-admin">
      <header class="pagina-admin__cabecera">
        <div class="pagina-admin__titulos">
          <h1>Usuarios</h1>
          <p class="pagina-admin__bajada">Alta, edición y consulta de usuarios de la clínica.</p>
        </div>
        <button mat-flat-button type="button" [disabled]="!catalogosListos()" (click)="abrirFormulario(null)">
          <mat-icon>add</mat-icon>
          Nuevo usuario
        </button>
      </header>

      <div class="panel-admin">
        <form class="filtros" [formGroup]="filtros">
          <mat-form-field appearance="outline" subscriptSizing="dynamic">
            <mat-label>Nombre</mat-label>
            <input matInput formControlName="nombre" />
          </mat-form-field>

          <mat-form-field appearance="outline" subscriptSizing="dynamic">
            <mat-label>Apellido</mat-label>
            <input matInput formControlName="apellido" />
          </mat-form-field>

          <mat-form-field appearance="outline" subscriptSizing="dynamic">
            <mat-label>Tipo de usuario</mat-label>
            <mat-select formControlName="rol">
              <mat-option value="">Todos</mat-option>
              @for (rol of roles; track rol.valor) {
                <mat-option [value]="rol.valor">{{ rol.etiqueta }}</mat-option>
              }
            </mat-select>
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

          <button mat-button type="button" (click)="limpiarFiltros()">Limpiar</button>
        </form>

        @if (cargando()) {
          <div class="estado-cargando">
            <mat-spinner diameter="28"></mat-spinner>
            <span>Cargando usuarios...</span>
          </div>
        } @else if (errorCarga()) {
          <div class="estado-vacio">
            <span>No se pudieron cargar los usuarios.</span>
            <button mat-button type="button" (click)="consultar()">Reintentar</button>
          </div>
        } @else if (usuarios().length === 0) {
          <div class="estado-vacio">No se encontraron registros</div>
        } @else {
          <div class="table-container">
          <table mat-table [dataSource]="usuarios()" class="tabla-admin">
            <ng-container matColumnDef="nombre">
              <th mat-header-cell *matHeaderCellDef>Apellido y nombre</th>
              <td mat-cell *matCellDef="let u">{{ u.apellido }}, {{ u.nombre }}</td>
            </ng-container>

            <ng-container matColumnDef="dni">
              <th mat-header-cell *matHeaderCellDef>DNI</th>
              <td mat-cell *matCellDef="let u">{{ u.dni }}</td>
            </ng-container>

            <ng-container matColumnDef="email">
              <th mat-header-cell *matHeaderCellDef>Correo</th>
              <td mat-cell *matCellDef="let u">{{ u.email }}</td>
            </ng-container>

            <ng-container matColumnDef="rol">
              <th mat-header-cell *matHeaderCellDef>Tipo</th>
              <td mat-cell *matCellDef="let u"><span class="badge badge--info">{{ etiquetaRol(u.rol) }}</span></td>
            </ng-container>

            <ng-container matColumnDef="sede">
              <th mat-header-cell *matHeaderCellDef>Sede</th>
              <td mat-cell *matCellDef="let u">{{ u.sede ?? '—' }}</td>
            </ng-container>

            <ng-container matColumnDef="especialidades">
              <th mat-header-cell *matHeaderCellDef>Especialidades</th>
              <td mat-cell *matCellDef="let u">{{ nombresEspecialidades(u) }}</td>
            </ng-container>

            <ng-container matColumnDef="acciones">
              <th mat-header-cell *matHeaderCellDef class="columna-acciones">Acciones</th>
              <td mat-cell *matCellDef="let u" class="columna-acciones">
                <button
                  mat-icon-button
                  type="button"
                  matTooltip="Modificar"
                  [disabled]="!catalogosListos()"
                  (click)="abrirFormulario(u)"
                >
                  <mat-icon>edit</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="columnas"></tr>
            <tr mat-row *matRowDef="let fila; columns: columnas"></tr>
          </table>
          </div>
        }

        <mat-paginator
          [length]="total()"
          [pageSize]="tamano()"
          [pageIndex]="pagina()"
          [pageSizeOptions]="[5, 10, 25]"
          (page)="cambiarPagina($event)"
        ></mat-paginator>
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
export class UsuariosListComponent {
  private readonly usuarioService = inject(UsuarioService);
  private readonly sedeService = inject(SedeService);
  private readonly especialidadService = inject(EspecialidadService);
  private readonly coberturaService = inject(CoberturaService);
  private readonly dialog = inject(MatDialog);
  private readonly notificador = inject(NotificadorService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly consultas = new Subject<void>();

  readonly roles = ROLES_USUARIO;
  readonly columnas = ['nombre', 'dni', 'email', 'rol', 'sede', 'especialidades', 'acciones'];
  readonly etiquetaRol = etiquetaRol;

  readonly filtros = new FormGroup({
    nombre: new FormControl('', { nonNullable: true }),
    apellido: new FormControl('', { nonNullable: true }),
    rol: new FormControl('', { nonNullable: true }),
    id_sede: new FormControl<number | null>(null),
  });

  readonly usuarios = signal<UsuarioAdmin[]>([]);
  readonly total = signal(0);
  readonly pagina = signal(0);
  readonly tamano = signal(10);
  readonly cargando = signal(true);
  readonly errorCarga = signal(false);
  readonly sedes = signal<Sede[]>([]);
  readonly especialidades = signal<Especialidad[]>([]);
  readonly coberturas = signal<Cobertura[]>([]);
  readonly catalogosListos = signal(false);

  constructor() {
    this.consultas
      .pipe(
        tap(() => {
          this.cargando.set(true);
          this.errorCarga.set(false);
        }),
        switchMap(() =>
          this.usuarioService
            .listar(this.filtros.getRawValue(), this.pagina() + 1, this.tamano())
            .pipe(
              catchError(() => {
                this.errorCarga.set(true);
                return of(null);
              }),
            ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((resultado) => {
        if (resultado) {
          this.usuarios.set(resultado.items);
          this.total.set(resultado.total);
        }
        this.cargando.set(false);
      });

    this.filtros.valueChanges
      .pipe(debounceTime(300), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.pagina.set(0);
        this.consultar();
      });

    forkJoin({
      sedes: this.sedeService.listar(),
      especialidades: this.especialidadService.listar(),
      coberturas: this.coberturaService.listar(),
    })
      .pipe(
        catchError(() => {
          this.notificador.error('No se pudieron cargar las sedes, especialidades y coberturas');
          return EMPTY;
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((catalogos) => {
        this.sedes.set(catalogos.sedes);
        this.especialidades.set(catalogos.especialidades);
        this.coberturas.set(catalogos.coberturas);
        this.catalogosListos.set(true);
      });

    this.consultar();
  }

  consultar(): void {
    this.consultas.next();
  }

  cambiarPagina(evento: PageEvent): void {
    this.pagina.set(evento.pageIndex);
    this.tamano.set(evento.pageSize);
    this.consultar();
  }

  limpiarFiltros(): void {
    this.filtros.reset({ nombre: '', apellido: '', rol: '', id_sede: null });
  }

  nombresEspecialidades(usuario: UsuarioAdmin): string {
    return usuario.especialidades.length > 0 ? usuario.especialidades.map((e) => e.descripcion).join(', ') : '—';
  }

  abrirFormulario(usuario: UsuarioAdmin | null): void {
    this.dialog
      .open(UsuarioDialogComponent, {
        data: {
          usuario,
          sedes: this.sedes(),
          especialidades: this.especialidades(),
          coberturas: this.coberturas(),
        },
      })
      .afterClosed()
      .subscribe((guardado) => {
        if (guardado) this.consultar();
      });
  }
}
