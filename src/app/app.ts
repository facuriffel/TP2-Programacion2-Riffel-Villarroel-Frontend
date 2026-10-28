import { Component, inject } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { HeaderComponent } from './shared/components/header/header.component';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    MatSidenavModule,
    HeaderComponent,
    SidebarComponent,
    FooterComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  readonly authService = inject(AuthService);
  private readonly breakpoints = inject(BreakpointObserver);

  readonly esMovil = toSignal(
    this.breakpoints.observe('(max-width: 767.98px)').pipe(map((r) => r.matches)),
    { initialValue: false },
  );

  cerrarEnMovil(sidenav: { close: () => unknown }): void {
    if (this.esMovil()) sidenav.close();
  }
}
