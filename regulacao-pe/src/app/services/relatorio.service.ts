import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { Relatorio } from '../models';
import { RELATORIOS_MOCK } from '../mock';
import { comLatencia } from './base-mock.service';

@Injectable({ providedIn: 'root' })
export class RelatorioService {
  private readonly relatorios = signal<Relatorio[]>([...RELATORIOS_MOCK]);

  listar(): Observable<Relatorio[]> {
    return comLatencia(this.relatorios());
  }

  criar(dados: { nome: string; tipo: string }, autorNome: string): void {
    const novo: Relatorio = {
      id: `rel-${Math.floor(Math.random() * 9000 + 1000)}`,
      nome: dados.nome,
      tipo: dados.tipo,
      geradoEm: new Date().toLocaleDateString('pt-BR'),
      geradoPor: autorNome,
      tamanho: `${(Math.random() * 2 + 0.3).toFixed(1)} MB`,
    };
    this.relatorios.update((lista) => [novo, ...lista]);
  }
}
