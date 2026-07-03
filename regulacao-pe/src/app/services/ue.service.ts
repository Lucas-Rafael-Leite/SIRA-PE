import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UnidadeExecutante } from '../models';
import { UES_MOCK } from '../mock';
import { comLatencia } from './base-mock.service';

@Injectable({ providedIn: 'root' })
export class UeService {
  listar(): Observable<UnidadeExecutante[]> {
    return comLatencia(UES_MOCK);
  }

  obterPorId(id: string): Observable<UnidadeExecutante | undefined> {
    return comLatencia(UES_MOCK.find((u) => u.id === id));
  }

  listarPorMunicipio(municipioId: string): Observable<UnidadeExecutante[]> {
    return comLatencia(UES_MOCK.filter((u) => u.municipioId === municipioId));
  }
}
