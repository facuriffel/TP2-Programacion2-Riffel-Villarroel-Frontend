import { RolUsuario } from '../../../core/models/admin.models';

export const ROLES_USUARIO: { valor: RolUsuario; etiqueta: string }[] = [
  { valor: 'administrador', etiqueta: 'Administrador' },
  { valor: 'medico', etiqueta: 'Médico' },
  { valor: 'operador', etiqueta: 'Operador' },
  { valor: 'paciente', etiqueta: 'Paciente' },
];

export const ROLES_ALTA = ROLES_USUARIO.filter((rol) => rol.valor !== 'paciente');

export function etiquetaRol(rol: RolUsuario): string {
  return ROLES_USUARIO.find((r) => r.valor === rol)?.etiqueta ?? rol;
}
