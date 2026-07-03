import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Municipio } from '../models';
import { MUNICIPIOS_MOCK } from '../mock';
import { comLatencia } from './base-mock.service';

@Injectable({ providedIn: 'root' })
export class MunicipioService {
  listar(): Observable<Municipio[]> {
    return comLatencia(MUNICIPIOS_MOCK);
  }

  obterPorId(id: string): Observable<Municipio | undefined> {
    return comLatencia(MUNICIPIOS_MOCK.find((m) => m.id === id));
  }
}
