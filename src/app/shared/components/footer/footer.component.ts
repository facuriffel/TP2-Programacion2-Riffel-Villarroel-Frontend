import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatButtonModule],
  template: `
    <footer class="app-footer">
      <div class="footer-container">
        <!-- Columna 1: Identidad y Contacto -->
        <div class="footer-col brand-col">
          <div class="footer-brand">
            <mat-icon class="brand-icon">health_and_safety</mat-icon>
            <span class="brand-title">Clínica Virtual</span>
          </div>
          <p class="brand-description">
            Plataforma integral de gestión hospitalaria y atención médica digital, brindando
            servicios de salud confiables y accesibles.
          </p>
        </div>

        <!-- Columna 2: Datos Institucionales y Sedes -->
        <div class="footer-col contact-col">
          <h4 class="col-title">Atención y Sedes</h4>
          <ul class="contact-list">
            <li>
              <mat-icon class="contact-icon">location_on</mat-icon>
              <span>Av. Corrientes 1234, CABA - Sede Central</span>
            </li>
            <li>
              <mat-icon class="contact-icon">phone</mat-icon>
              <span>Urgencias: 0800-222-2546 | Turnos: (011) 4567-8900</span>
            </li>
            <li>
              <mat-icon class="contact-icon">email</mat-icon>
              <span>contacto&#64;clinicavirtual.com.ar</span>
            </li>
          </ul>
        </div>

        <!-- Columna 3: Enlaces Institucionales -->
        <div class="footer-col links-col">
          <h4 class="col-title">Enlaces de Interés</h4>
          <ul class="footer-links">
            <li>
              <a routerLink="/en-construccion">Portal de Pacientes</a>
            </li>
            <li>
              <a routerLink="/en-construccion">Cartilla Médica</a>
            </li>
            <li>
              <a routerLink="/en-construccion">Términos y Condiciones</a>
            </li>
            <li>
              <a routerLink="/en-construccion">Política de Privacidad</a>
            </li>
          </ul>
        </div>
      </div>

      <div class="footer-bottom">
        <p class="copyright-text">
          &copy; {{ currentYear }} Clínica Virtual. Todos los derechos reservados. Trabajo Práctico
          Programación 2.
        </p>
      </div>
    </footer>
  `,
  styles: [
    `
      .app-footer {
        background-color: #0f172a;
        color: #cbd5e1;
        width: 100%;
        margin-top: auto;
        border-top: 1px solid #1e293b;
      }

      .footer-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 40px 24px 28px;
        display: grid;
        grid-template-columns: 1.4fr 1.3fr 1fr;
        gap: 32px;
      }

      @media (max-width: 860px) {
        .footer-container {
          grid-template-columns: 1fr;
          gap: 24px;
          padding: 32px 16px 20px;
        }
      }

      .footer-brand {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #ffffff;
        margin-bottom: 12px;
      }

      .brand-icon {
        font-size: 26px;
        width: 26px;
        height: 26px;
        color: #38bdf8;
      }

      .brand-title {
        font-size: 1.15rem;
        font-weight: 700;
        letter-spacing: 0.3px;
      }

      .brand-description {
        font-size: 0.88rem;
        line-height: 1.6;
        color: #94a3b8;
        margin: 0;
      }

      .col-title {
        color: #ffffff;
        font-size: 0.95rem;
        font-weight: 600;
        margin: 0 0 14px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .contact-list,
      .footer-links {
        list-style: none;
        padding: 0;
        margin: 0;
      }

      .contact-list li {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        font-size: 0.88rem;
        line-height: 1.5;
        margin-bottom: 10px;
        color: #cbd5e1;
      }

      .contact-icon {
        color: #38bdf8;
        font-size: 18px;
        width: 18px;
        height: 18px;
        flex-shrink: 0;
        margin-top: 2px;
      }

      .footer-links li {
        margin-bottom: 8px;
      }

      .footer-links a {
        color: #94a3b8;
        text-decoration: none;
        font-size: 0.88rem;
        transition: color 0.15s ease;
      }

      .footer-links a:hover {
        color: #38bdf8;
        text-decoration: underline;
      }

      .footer-bottom {
        border-top: 1px solid #1e293b;
        padding: 16px 24px;
        text-align: center;
      }

      .copyright-text {
        font-size: 0.8rem;
        color: #64748b;
        margin: 0;
      }
    `,
  ],
})
export class FooterComponent {
  readonly currentYear = new Date().getFullYear();
}
