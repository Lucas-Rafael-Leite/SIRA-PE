import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { LogVaga, TipoLogVaga, Usuario } from '../models';
import { LOGS_VAGA_MOCK } from '../mock/vagas-log.mock';
import { comLatencia } from './base-mock.service';

@Injectable({ providedIn: 'root' })
export class VagaLogService {
  private readonly logs = signal<LogVaga[]>([...LOGS_VAGA_MOCK]);

  listarPorVaga(vagaId: string): Observable<LogVaga[]> {
    return comLatencia(
      this.logs()
        .filter((l) => l.vagaId === vagaId)
        .sort((a, b) => (a.data < b.data ? 1 : -1)),
    );
  }

  registrar(vagaId: string, tipo: TipoLogVaga, usuario: Usuario | null, detalhe: string): void {
    if (!usuario) return;
    const novo: LogVaga = {
      id: `lv-${Math.floor(Math.random() * 90000 + 10000)}`,
      vagaId,
      tipo,
      usuario: usuario.nome,
      perfil: usuario.perfil,
      data: new Date().toLocaleString('pt-BR'),
      detalhe,
    };
    this.logs.update((lista) => [novo, ...lista]);
  }
}
