import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatSnackBarModule
    ],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent {
    private fb = inject(FormBuilder);
    private authService = inject(AuthService);
    private router = inject(Router);
    private snackBar = inject(MatSnackBar);

    cargando = false;
    ocultarPassword = true;

    loginForm = this.fb.group({
        dni: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
        password: ['', [Validators.required]]
    });

    onSubmit(): void {
        if (this.loginForm.invalid) return;

        this.cargando = true;
        const credenciales = {
            dni: this.loginForm.value.dni!,
            password: this.loginForm.value.password!
        };

        this.authService.login(credenciales).subscribe({
            next: (res) => {
                this.cargando = false;
                const usuario = res.datos?.usuario;
                this.snackBar.open(`¡Bienvenido/a ${usuario?.nombre || ''}!`, 'Cerrar', { duration: 3000 });

                // Redirección según rol
                const rol = usuario?.rol;
                if (rol === 'administrador') this.router.navigate(['/admin']);
                else if (rol === 'medico') this.router.navigate(['/medico']);
                else if (rol === 'operador') this.router.navigate(['/operador']);
                else this.router.navigate(['/paciente']);
            },
            error: (err) => {
                this.cargando = false;
                const mensaje = err.error?.datos?.mensaje || 'Credenciales inválidas. Verificá los datos ingresados.';
                this.snackBar.open(mensaje, 'Cerrar', { duration: 4000 });
            }
        });
    }
}