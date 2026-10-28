import { Component } from '@angular/core';
import { RegistroComponent } from '../auth/registro/registro.component';

@Component({
  selector: 'app-operador-pacientes',
  standalone: true,
  imports: [RegistroComponent],
  template: `
    <section class="pagina-admin">
      <header class="pagina-admin__cabecera">
        <div class="pagina-admin__titulos">
          <h1>Alta de pacientes</h1>
          <p class="pagina-admin__bajada">Registro de nuevos pacientes.</p>
        </div>
      </header>
      <app-registro [embebido]="true" />
    </section>
  `,
  styles: `
    app-registro {
      display: block;
      max-width: 560px;
    }
  `,
})
export class OperadorPacientesComponent {}
