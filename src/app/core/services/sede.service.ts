import { Injectable } from '@angular/core';
import { Sede } from '../models/admin.models';
import { CatalogoApi } from './catalogo-api';

@Injectable({ providedIn: 'root' })
export class SedeService extends CatalogoApi<Sede> {
    constructor() {
        super('sedes', 'sedes');
    }
}
