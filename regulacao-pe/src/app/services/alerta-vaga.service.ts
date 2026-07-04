import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { AlertaDisponibilidadeVaga } from '../models';
import { ALERTAS_VAGA_MOCK } from '../mock/alertas-vaga.mock';
import { comLatencia } from './base-mock.service';

@Injectable({ providedIn: 'root' })
export class AlertaVagaService {
  private readonly alertas = signal<AlertaDisponibilidadeVaga[]>([...ALERTAS_VAGA_MOCK]);

  listarPorUe(ueId: string): Observable<AlertaDisponibilidadeVaga[]> {
    return comLatencia(this.alertas().filter((a) => a.ueId === ueId));
  }

  criar(ueId: string, ueNome: string, especialidade: string): void {
    const novo: AlertaDisponibilidadeVaga = {
      id: `av-${Math.floor(Math.random() * 90000 + 10000)}`,
      ueId,
      ueNome,
      especialidade,
      criadoEm: new Date().toLocaleDateString('pt-BR'),
      ativo: true,
    };
    this.alertas.update((lista) => [novo, ...lista]);
  }

  remover(id: string): void {
    this.alertas.update((lista) => lista.filter((a) => a.id !== id));
  }
}
