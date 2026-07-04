import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { AlertaDisponibilidadeVaga, Usuario } from '../models';
import { ALERTAS_VAGA_MOCK } from '../mock/alertas-vaga.mock';
import { comLatencia } from './base-mock.service';

@Injectable({ providedIn: 'root' })
export class AlertaVagaService {
  private readonly alertas = signal<AlertaDisponibilidadeVaga[]>([...ALERTAS_VAGA_MOCK]);

  /** Alertas de disponibilidade criados pelo próprio usuário logado. */
  listarPorUsuario(usuario: Usuario | null): Observable<AlertaDisponibilidadeVaga[]> {
    if (!usuario) return comLatencia([]);
    return comLatencia(this.alertas().filter((a) => a.criadoPorNome === usuario.nome));
  }

  criar(usuario: Usuario, escopoNome: string, especialidade: string): void {
    const novo: AlertaDisponibilidadeVaga = {
      id: `av-${Math.floor(Math.random() * 90000 + 10000)}`,
      criadoPorNome: usuario.nome,
      perfilCriador: usuario.perfil,
      escopoNome,
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
