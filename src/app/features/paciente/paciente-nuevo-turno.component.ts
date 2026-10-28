import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NuevoTurnoComponent } from '../../shared/components/nuevo-turno/nuevo-turno.component';

@Component({
  selector: 'app-paciente-nuevo-turno',
  standalone: true,
  imports: [NuevoTurnoComponent],
  template: `
    <section class="pagina-admin">
      <header class="pagina-admin__cabecera">
        <div class="pagina-admin__titulos">
          <h1>Solicitar turno</h1>
          <p class="pagina-admin__bajada">Seguí los pasos para reservar tu consulta.</p>
        </div>
      </header>

      <app-nuevo-turno (creado)="irAMisTurnos()" />
    </section>
  `,
  styles: `
    .pagina-admin {
      max-width: 900px;
      margin: 0 auto;
      width: 100%;
    }
  `,
})
export class PacienteNuevoTurnoComponent {
  private readonly router = inject(Router);

  irAMisTurnos(): void {
    this.router.navigate(['/paciente/mis-turnos']);
  }
}
