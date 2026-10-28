export function aIsoFecha(fecha: Date | null | undefined): string | null {
    if (!fecha) return null;
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
}

export function desdeIsoFecha(valor: string | null | undefined): Date | null {
    if (!valor) return null;
    const [anio, mes, dia] = valor.slice(0, 10).split('-').map(Number);
    return new Date(anio, mes - 1, dia);
}

export function hoy(): Date {
    const ahora = new Date();
    return new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
}

export function calcularEdad(fechaNacimiento: string | null | undefined, referencia: Date = hoy()): number | null {
    const nacimiento = desdeIsoFecha(fechaNacimiento);
    if (!nacimiento) return null;
    let edad = referencia.getFullYear() - nacimiento.getFullYear();
    const cumplio =
        referencia.getMonth() > nacimiento.getMonth() ||
        (referencia.getMonth() === nacimiento.getMonth() && referencia.getDate() >= nacimiento.getDate());
    if (!cumplio) edad--;
    return edad;
}
