import { Injectable } from '@angular/core';
import { NativeDateAdapter } from '@angular/material/core';

/** Interpreta y muestra las fechas escritas como DD/MM/YYYY (el adaptador nativo asume MM/DD/YYYY). */
@Injectable()
export class FechaAdapter extends NativeDateAdapter {
    override parse(valor: unknown): Date | null {
        if (typeof valor !== 'string') return super.parse(valor);
        const texto = valor.trim();
        if (!texto) return null;

        const coincidencia = /^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})$/.exec(texto) ?? /^(\d{2})(\d{2})(\d{4})$/.exec(texto);
        if (!coincidencia) return this.invalid();

        const dia = Number(coincidencia[1]);
        const mes = Number(coincidencia[2]);
        const anio = Number(coincidencia[3]);
        const fecha = new Date(anio, mes - 1, dia);
        const valida = fecha.getFullYear() === anio && fecha.getMonth() === mes - 1 && fecha.getDate() === dia;
        return valida && anio >= 1900 ? fecha : this.invalid();
    }

    override format(fecha: Date, formato: unknown): string {
        if (!this.isValid(fecha)) throw Error('FechaAdapter: no se puede formatear una fecha inválida.');
        if (typeof formato === 'object' && formato !== null && 'month' in formato && !('day' in formato)) {
            return super.format(fecha, formato as Intl.DateTimeFormatOptions);
        }
        const dia = String(fecha.getDate()).padStart(2, '0');
        const mes = String(fecha.getMonth() + 1).padStart(2, '0');
        return `${dia}/${mes}/${fecha.getFullYear()}`;
    }
}
