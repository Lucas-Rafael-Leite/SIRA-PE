import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RegistroAuditoria } from '../models';
import { AUDITORIA_MOCK } from '../mock';
import { comLatencia } from './base-mock.service';

@Injectable({ providedIn: 'root' })
export class AuditoriaService {
  listar(): Observable<RegistroAuditoria[]> {
    return comLatencia(AUDITORIA_MOCK);
  }
}
