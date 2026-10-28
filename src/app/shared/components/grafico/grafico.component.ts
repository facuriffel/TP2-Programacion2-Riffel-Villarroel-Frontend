import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  effect,
  input,
  viewChild,
} from '@angular/core';
import {
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  DoughnutController,
  Legend,
  LinearScale,
  Tooltip,
} from 'chart.js';

Chart.register(
  BarController,
  BarElement,
  DoughnutController,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
);

const PALETA = ['#1e3a8a', '#0f766e', '#b45309', '#6d28d9', '#be123c', '#475569', '#0369a1', '#4d7c0f'];

@Component({
  selector: 'app-grafico',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="contenedor">
      <canvas #lienzo [attr.aria-label]="descripcion()" role="img"></canvas>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .contenedor {
      position: relative;
      height: 280px;
    }
  `,
})
export class GraficoComponent implements OnDestroy {
  readonly tipo = input<'bar' | 'doughnut'>('bar');
  readonly etiquetas = input.required<string[]>();
  readonly valores = input.required<number[]>();
  readonly serie = input('Turnos');
  readonly descripcion = input('Gráfico');

  private readonly lienzo = viewChild.required<ElementRef<HTMLCanvasElement>>('lienzo');
  private grafico: Chart | null = null;

  constructor() {
    effect(() => {
      const tipo = this.tipo();
      const etiquetas = this.etiquetas();
      const valores = this.valores();
      const serie = this.serie();

      this.grafico?.destroy();
      this.grafico = new Chart(this.lienzo().nativeElement, {
        type: tipo,
        data: {
          labels: etiquetas,
          datasets: [
            {
              label: serie,
              data: valores,
              backgroundColor: tipo === 'bar' ? PALETA[0] : etiquetas.map((_, i) => PALETA[i % PALETA.length]),
              borderWidth: 0,
              maxBarThickness: 48,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: tipo === 'doughnut', position: 'right' } },
          scales:
            tipo === 'bar'
              ? { y: { beginAtZero: true, ticks: { precision: 0 } }, x: { grid: { display: false } } }
              : {},
        },
      });
    });
  }

  ngOnDestroy(): void {
    this.grafico?.destroy();
  }
}
