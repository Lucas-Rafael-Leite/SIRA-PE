import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { Agenda } from '../models';
import { AGENDAS_MOCK } from '../mock';
import { comLatencia } from './base-mock.service';

@Injectable({ providedIn: 'root' })
export class AgendaService {
  private readonly agendas = signal<Agenda[]>([...AGENDAS_MOCK]);

  listar(): Observable<Agenda[]> {
    return comLatencia(this.agendas());
  }

  listarPorUe(ueId: string): Observable<Agenda[]> {
    return comLatencia(this.agendas().filter((a) => a.ueId === ueId));
  }

  obterPorId(id: string): Observable<Agenda | undefined> {
    return comLatencia(this.agendas().find((a) => a.id === id));
  }

  /** Devolve a agenda para a UE de origem, com um motivo (usado por GERES/GRAMB/Administrador). */
  devolver(id: string, motivo: string): void {
    this.agendas.update((lista) =>
      lista.map((a) => (a.id === id ? { ...a, status: 'devolvida' as const, motivoDevolucao: motivo } : a)),
    );
  }

  /** Reenvia uma agenda devolvida, voltando ao status pendente e incrementando o contador de reenvios. */
  reenviar(id: string, alteracoes: Partial<Pick<Agenda, 'vagasTotais' | 'vagasDisponiveis' | 'periodo' | 'profissionalNome'>>): void {
    this.agendas.update((lista) =>
      lista.map((a) =>
        a.id === id
          ? {
              ...a,
              ...alteracoes,
              status: 'pendente' as const,
              motivoDevolucao: undefined,
              vezesReenviada: a.vezesReenviada + 1,
              dataEnvio: new Date().toLocaleDateString('pt-BR'),
            }
          : a,
      ),
    );
  }

  /** Cria uma nova agenda a partir do wizard de "Enviar Agenda". */
  criar(agenda: Omit<Agenda, 'id' | 'status' | 'vezesReenviada' | 'dataEnvio'>): void {
    const nova: Agenda = {
      ...agenda,
      id: `ag-${Math.floor(Math.random() * 9000 + 1000)}`,
      status: 'pendente',
      vezesReenviada: 0,
      dataEnvio: new Date().toLocaleDateString('pt-BR'),
    };
    this.agendas.update((lista) => [nova, ...lista]);
  }
}
