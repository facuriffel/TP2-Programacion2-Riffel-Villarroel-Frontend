import { Injectable } from '@angular/core';
import { Cobertura } from '../models/auth.models';
import { CatalogoApi } from './catalogo-api';

@Injectable({ providedIn: 'root' })
export class CoberturaService extends CatalogoApi<Cobertura> {
    constructor() {
        super('coberturas', 'coberturas');
    }
}
