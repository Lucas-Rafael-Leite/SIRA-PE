import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { Paciente } from '../models';
import { PACIENTES_MOCK } from '../mock';
import { comLatencia } from './base-mock.service';

@Injectable({ providedIn: 'root' })
export class PacienteService {
  private readonly pacientes = signal<Paciente[]>([...PACIENTES_MOCK]);

  listar(): Observable<Paciente[]> {
    return comLatencia(this.pacientes());
  }

  buscar(termo: string, limite = 8): Paciente[] {
    const termoBusca = termo.trim().toLowerCase();
    const lista = this.pacientes();
    if (!termoBusca) return lista.slice(0, limite);
    return lista.filter((p) => p.nome.toLowerCase().includes(termoBusca)).slice(0, limite);
  }

  /** Remove o paciente da fila de espera após a marcação bem-sucedida de uma consulta. */
  removerDaFila(id: string): void {
    this.pacientes.update((lista) =>
      lista.map((p) => (p.id === id ? { ...p, emFilaDeEspera: false } : p)),
    );
  }
}
