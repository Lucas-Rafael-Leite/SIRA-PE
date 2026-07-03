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
}
