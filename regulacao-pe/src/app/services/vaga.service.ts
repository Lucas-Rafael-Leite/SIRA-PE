import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { Vaga } from '../models';
import { VAGAS_MOCK } from '../mock';
import { comLatencia } from './base-mock.service';

@Injectable({ providedIn: 'root' })
export class VagaService {
  private readonly vagas = signal<Vaga[]>([...VAGAS_MOCK]);

  listar(): Observable<Vaga[]> {
    return comLatencia(this.vagas());
  }

  obterPorId(id: string): Observable<Vaga | undefined> {
    return comLatencia(this.vagas().find((v) => v.id === id));
  }

  vagaAtual(id: string): Vaga | undefined {
    return this.vagas().find((v) => v.id === id);
  }

  marcarEstrategica(id: string): void {
    this.vagas.update((lista) =>
      lista.map((v) => (v.id === id ? { ...v, estrategica: true } : v)),
    );
  }

  bloquear(id: string): void {
    this.vagas.update((lista) =>
      lista.map((v) => (v.id === id ? { ...v, status: 'bloqueada' as const } : v)),
    );
  }

  /** Marca a vaga com o paciente escolhido (fim do fluxo de marcação de consulta). */
  marcarComPaciente(id: string, pacienteNome: string): void {
    this.vagas.update((lista) =>
      lista.map((v) => (v.id === id ? { ...v, status: 'agendada' as const, pacienteNome } : v)),
    );
  }

  /** Cancela uma vaga preenchida: ela volta a ficar disponível para nova marcação. */
  cancelar(id: string): void {
    this.vagas.update((lista) =>
      lista.map((v) => (v.id === id ? { ...v, status: 'disponivel' as const, pacienteNome: undefined } : v)),
    );
  }
}
