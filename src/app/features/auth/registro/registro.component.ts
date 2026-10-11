import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';
import { CoberturaService } from '../../../core/services/cobertura.service';
import { Cobertura } from '../../../core/models/auth.models';

@Component({
    selector: 'app-registro',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatSelectModule,
        MatIconModule,
        MatSnackBarModule
    ],
    templateUrl: './registro.component.html',
    styleUrls: ['./registro.component.css']
})
export class RegistroComponent implements OnInit {
    private fb = inject(FormBuilder);
    private authService = inject(AuthService);
    private coberturaService = inject(CoberturaService);
    private router = inject(Router);
    private snackBar = inject(MatSnackBar);

    coberturas: Cobertura[] = [];
    cargando = false;
    ocultarPassword = true;

    registroForm = this.fb.group({
        nombre: ['', [Validators.required, Validators.minLength(2)]],
        apellido: ['', [Validators.required, Validators.minLength(2)]],
        dni: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        fecha_nacimiento: ['', [Validators.required]],
        id_cobertura: [null, [Validators.required]]
    });

    ngOnInit(): void {
        this.cargarCoberturas();
    }

    cargarCoberturas(): void {
        this.coberturaService.listar().subscribe({
            next: (res) => {
                this.coberturas = res.datos?.coberturas || [];
            },
            error: () => {
                this.snackBar.open('Error al cargar la lista de coberturas', 'Cerrar', { duration: 3000 });
            }
        });
    }

    onSubmit(): void {
        if (this.registroForm.invalid) return;

        this.cargando = true;
        this.authService.registro(this.registroForm.value).subscribe({
            next: () => {
                this.cargando = false;
                this.snackBar.open('¡Registro exitoso! Iniciá sesión con tus datos.', 'Cerrar', { duration: 4000 });
                this.router.navigate(['/login']);
            },
            error: (err) => {
                this.cargando = false;
                const mensaje = err.error?.datos?.mensaje || err.error?.datos?.detalle || 'Error al procesar el registro';
                this.snackBar.open(mensaje, 'Cerrar', { duration: 4000 });
            }
        });
    }
}