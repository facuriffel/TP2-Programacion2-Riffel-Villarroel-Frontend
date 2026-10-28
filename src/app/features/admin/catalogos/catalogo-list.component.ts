import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NotificadorService } from '../../../core/services/notificador.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { CatalogoDialogComponent } from './catalogo-dialog.component';
import { CatalogoConfig, RegistroCatalogo, valorDeCampo } from './catalogo.config';

@Component({
  selector: 'app-catalogo-list',
  standalone: true,
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  template: `
    <section class="pagina-admin">
      <header class="pagina-admin__cabecera">
        <div class="pagina-admin__titulos">
          <h1>{{ config.titulo }}</h1>
          <p class="pagina-admin__bajada">Gestión del catálogo con búsqueda, alta, modificación y baja.</p>
        </div>
        <button mat-flat-button type="button" (click)="abrirFormulario(null)">
          <mat-icon>add</mat-icon>
          Nueva {{ config.entidad }}
        </button>
      </header>

      <div class="panel-admin">
        <div class="barra-filtro">
          <mat-form-field appearance="outline" subscriptSizing="dynamic">
            <mat-label>Buscar</mat-label>
            <input matInput type="search" [value]="filtro()" (input)="filtrar($event)" />
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>
        </div>

        @if (cargando()) {
          <div class="estado-cargando">
            <mat-spinner diameter="28"></mat-spinner>
            <span>Cargando {{ config.titulo.toLowerCase() }}...</span>
          </div>
        } @else if (errorCarga()) {
          <div class="estado-vacio">
            <span>No se pudieron cargar los registros.</span>
            <button mat-button type="button" (click)="cargar()">Reintentar</button>
          </div>
        } @else if (filtrados().length === 0) {
          <div class="estado-vacio">No se encontraron registros</div>
        } @else {
          <div class="table-container">
          <table mat-table [dataSource]="visibles()" class="tabla-admin">
            @for (campo of config.campos; track campo.clave) {
              <ng-container [matColumnDef]="campo.clave">
                <th mat-header-cell *matHeaderCellDef>{{ campo.etiqueta }}</th>
                <td mat-cell *matCellDef="let fila">{{ valor(fila, campo.clave) }}</td>
              </ng-container>
            }

            <ng-container matColumnDef="acciones">
              <th mat-header-cell *matHeaderCellDef class="columna-acciones">Acciones</th>
              <td mat-cell *matCellDef="let fila" class="columna-acciones">
                <button mat-icon-button type="button" matTooltip="Modificar" (click)="abrirFormulario(fila)">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button type="button" matTooltip="Eliminar" (click)="eliminar(fila)">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="columnas()"></tr>
            <tr mat-row *matRowDef="let fila; columns: columnas()"></tr>
          </table>
          </div>

          <mat-paginator
            [length]="filtrados().length"
            [pageSize]="tamano()"
            [pageIndex]="pagina()"
            [pageSizeOptions]="[5, 10, 25]"
            (page)="cambiarPagina($event)"
          ></mat-paginator>
        }
      </div>
    </section>
  `,
  styles: `
    .barra-filtro {
      padding: 16px 16px 8px;
    }
    .barra-filtro mat-form-field {
      width: 320px;
    }
  `,
})
export class CatalogoListComponent {
  readonly config = inject(ActivatedRoute).snapshot.data['catalogo'] as CatalogoConfig;
  private readonly api = inject(this.config.servicio);
  private readonly dialog = inject(MatDialog);
  private readonly notificador = inject(NotificadorService);

  readonly registros = signal<RegistroCatalogo[]>([]);
  readonly cargando = signal(true);
  readonly errorCarga = signal(false);
  readonly filtro = signal('');
  readonly pagina = signal(0);
  readonly tamano = signal(10);

  readonly columnas = computed(() => [...this.config.campos.map((c) => c.clave), 'acciones']);

  readonly filtrados = computed(() => {
    const texto = this.normalizar(this.filtro());
    if (!texto) return this.registros();
    return this.registros().filter((registro) =>
      this.config.campos.some((campo) => this.normalizar(valorDeCampo(registro, campo.clave)).includes(texto)),
    );
  });

  readonly visibles = computed(() => {
    const inicio = this.pagina() * this.tamano();
    return this.filtrados().slice(inicio, inicio + this.tamano());
  });

  constructor() {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.errorCarga.set(false);
    this.api.listar().subscribe({
      next: (registros) => {
        this.registros.set(registros);
        this.ajustarPagina();
        this.cargando.set(false);
      },
      error: () => {
        this.errorCarga.set(true);
        this.cargando.set(false);
      },
    });
  }

  valor(registro: RegistroCatalogo, clave: string): string {
    return valorDeCampo(registro, clave);
  }

  filtrar(evento: Event): void {
    this.filtro.set((evento.target as HTMLInputElement).value);
    this.pagina.set(0);
  }

  cambiarPagina(evento: PageEvent): void {
    this.pagina.set(evento.pageIndex);
    this.tamano.set(evento.pageSize);
  }

  abrirFormulario(registro: RegistroCatalogo | null): void {
    this.dialog
      .open(CatalogoDialogComponent, { data: { config: this.config, registro } })
      .afterClosed()
      .subscribe((guardado) => {
        if (guardado) this.recargarSinSpinner();
      });
  }

  eliminar(registro: RegistroCatalogo): void {
    const nombre = valorDeCampo(registro, this.config.campoPrincipal);
    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          titulo: `Eliminar ${this.config.entidad}`,
          mensaje: `¿Está seguro de eliminar ${this.config.entidadConArticulo} "${nombre}"?`,
        },
      })
      .afterClosed()
      .subscribe((confirmado) => {
        if (!confirmado) return;
        this.api.eliminar(registro.id).subscribe({
          next: (mensaje) => {
            this.notificador.exito(mensaje);
            this.registros.update((lista) => lista.filter((r) => r.id !== registro.id));
            this.ajustarPagina();
          },
          error: (err) => this.notificador.errorApi(err, 'No se pudo eliminar el registro'),
        });
      });
  }

  private recargarSinSpinner(): void {
    this.api.listar().subscribe({
      next: (registros) => {
        this.registros.set(registros);
        this.ajustarPagina();
      },
      error: () => this.notificador.error('No se pudo actualizar el listado'),
    });
  }

  private ajustarPagina(): void {
    const ultima = Math.max(Math.ceil(this.filtrados().length / this.tamano()) - 1, 0);
    if (this.pagina() > ultima) this.pagina.set(ultima);
  }

  private normalizar(texto: string): string {
    return texto
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .trim();
  }
}
