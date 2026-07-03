import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Relatorio } from '../models';
import { RELATORIOS_MOCK } from '../mock';
import { comLatencia } from './base-mock.service';

@Injectable({ providedIn: 'root' })
export class RelatorioService {
  listar(): Observable<Relatorio[]> {
    return comLatencia(RELATORIOS_MOCK);
  }
}
