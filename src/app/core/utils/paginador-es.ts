import { Injectable } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';

@Injectable()
export class PaginadorEs extends MatPaginatorIntl {
  override itemsPerPageLabel = 'Registros por página';
  override nextPageLabel = 'Página siguiente';
  override previousPageLabel = 'Página anterior';
  override firstPageLabel = 'Primera página';
  override lastPageLabel = 'Última página';

  override getRangeLabel = (pagina: number, tamano: number, total: number): string => {
    if (total === 0) return '0 de 0';
    const inicio = pagina * tamano + 1;
    const fin = Math.min((pagina + 1) * tamano, total);
    return `${inicio} – ${fin} de ${total}`;
  };
}
