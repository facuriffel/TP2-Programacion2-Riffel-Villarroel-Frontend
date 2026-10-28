import { Type } from '@angular/core';
import { CatalogoApi } from '../../../core/services/catalogo-api';
import { CoberturaService } from '../../../core/services/cobertura.service';
import { EspecialidadService } from '../../../core/services/especialidad.service';
import { SedeService } from '../../../core/services/sede.service';

export interface CampoCatalogo {
  clave: string;
  etiqueta: string;
  maxLength: number;
  patron?: RegExp;
  mensajePatron?: string;
}

export interface CatalogoConfig {
  titulo: string;
  entidad: string;
  entidadConArticulo: string;
  campoPrincipal: string;
  campos: CampoCatalogo[];
  servicio: Type<CatalogoApi<{ id: number }>>;
}

export type RegistroCatalogo = { id: number };

export function valorDeCampo(registro: RegistroCatalogo, clave: string): string {
  return String((registro as unknown as Record<string, unknown>)[clave] ?? '');
}

export const SEDES_CONFIG: CatalogoConfig = {
  titulo: 'Sedes',
  entidad: 'sede',
  entidadConArticulo: 'la sede',
  campoPrincipal: 'nombre',
  campos: [
    { clave: 'nombre', etiqueta: 'Nombre', maxLength: 100 },
    { clave: 'direccion', etiqueta: 'Dirección', maxLength: 150 },
    {
      clave: 'telefono',
      etiqueta: 'Teléfono',
      maxLength: 30,
      patron: /^[0-9+()\-\s]{6,30}$/,
      mensajePatron: 'Ingresá un teléfono válido (solo números, espacios, +, - y paréntesis)',
    },
  ],
  servicio: SedeService,
};

export const ESPECIALIDADES_CONFIG: CatalogoConfig = {
  titulo: 'Especialidades',
  entidad: 'especialidad',
  entidadConArticulo: 'la especialidad',
  campoPrincipal: 'descripcion',
  campos: [{ clave: 'descripcion', etiqueta: 'Descripción', maxLength: 100 }],
  servicio: EspecialidadService,
};

export const COBERTURAS_CONFIG: CatalogoConfig = {
  titulo: 'Coberturas',
  entidad: 'cobertura',
  entidadConArticulo: 'la cobertura',
  campoPrincipal: 'nombre',
  campos: [{ clave: 'nombre', etiqueta: 'Nombre', maxLength: 100 }],
  servicio: CoberturaService,
};
