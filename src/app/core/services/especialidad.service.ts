import { Injectable } from '@angular/core';
import { Especialidad } from '../models/admin.models';
import { CatalogoApi } from './catalogo-api';

@Injectable({ providedIn: 'root' })
export class EspecialidadService extends CatalogoApi<Especialidad> {
    constructor() {
        super('especialidades', 'especialidades');
    }
}
