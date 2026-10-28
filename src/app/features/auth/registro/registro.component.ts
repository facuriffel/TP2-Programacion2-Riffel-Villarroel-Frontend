import { Component, OnInit, ViewChild, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroupDirective, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';
import { CoberturaService } from '../../../core/services/cobertura.service';
import { Cobertura } from '../../../core/models/auth.models';
import { aIsoFecha, hoy } from '../../../core/utils/fechas';

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
        MatDatepickerModule,
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

    /** Dentro de otra pantalla (p. ej. alta por operador): no redirige al login ni muestra el pie. */
    embebido = input(false);
    registrado = output<void>();

    @ViewChild(FormGroupDirective) private formDirective!: FormGroupDirective;

    coberturas = signal<Cobertura[]>([]);
    cargando = signal(false);
    ocultarPassword = true;
    readonly animarOjo = signal(false);
    readonly hoy = hoy();

    registroForm = this.fb.group({
        nombre: ['', [Validators.required, Validators.minLength(2)]],
        apellido: ['', [Validators.required, Validators.minLength(2)]],
        dni: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        fecha_nacimiento: [null as Date | null, [Validators.required]],
        id_cobertura: [null as number | null]
    });

    alternarPassword(): void {
        this.ocultarPassword = !this.ocultarPassword;
        this.animarOjo.set(true);
        setTimeout(() => this.animarOjo.set(false), 350);
    }

    ngOnInit(): void {
        this.cargarCoberturas();
    }

    cargarCoberturas(): void {
        this.coberturaService.listar().subscribe({
            next: (coberturas) => {
                this.coberturas.set(coberturas);
            },
            error: () => {
                this.snackBar.open('Error al cargar la lista de coberturas', 'Cerrar', { duration: 3000 });
            }
        });
    }

    onSubmit(): void {
        if (this.registroForm.invalid) return;

        this.cargando.set(true);
        this.authService.registro({
            ...this.registroForm.value,
            fecha_nacimiento: aIsoFecha(this.registroForm.value.fecha_nacimiento)
        }).subscribe({
            next: () => {
                this.cargando.set(false);
                if (this.embebido()) {
                    this.snackBar.open('Paciente registrado correctamente.', 'Cerrar', { duration: 4000 });
                    this.registrado.emit();
                    this.formDirective.resetForm();
                    return;
                }
                this.snackBar.open('¡Registro exitoso! Iniciá sesión con tus datos.', 'Cerrar', { duration: 4000 });
                this.router.navigate(['/login']);
            },
            error: (err) => {
                this.cargando.set(false);
                const mensaje = err.error?.datos?.mensaje || err.error?.datos?.detalle || 'Error al procesar el registro';
                this.snackBar.open(mensaje, 'Cerrar', { duration: 4000 });
            }
        });
    }
}