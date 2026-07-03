import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { Consulta } from '../models';
import { CONSULTAS_MOCK } from '../mock';
import { comLatencia } from './base-mock.service';

@Injectable({ providedIn: 'root' })
export class ConsultaService {
  private readonly consultas = signal<Consulta[]>([...CONSULTAS_MOCK]);

  listar(): Observable<Consulta[]> {
    return comLatencia(this.consultas());
  }

  cancelar(id: string, _motivo: string): void {
    this.consultas.update((lista) =>
      lista.map((c) => (c.id === id ? { ...c, status: 'cancelada' as const } : c)),
    );
  }

  marcar(consulta: Partial<Consulta>): void {
    const novo: Consulta = {
      id: `cons-${Math.floor(Math.random() * 90000 + 10000)}`,
      protocolo: `PE${Math.floor(Math.random() * 900000 + 100000)}`,
      pacienteId: consulta.pacienteId ?? '',
      pacienteNome: consulta.pacienteNome ?? '',
      especialidade: consulta.especialidade ?? '',
      ueId: consulta.ueId ?? '',
      ueNome: consulta.ueNome ?? '',
      municipioNome: consulta.municipioNome ?? '',
      profissionalNome: consulta.profissionalNome ?? 'A definir',
      data: consulta.data ?? '',
      hora: consulta.hora ?? '',
      status: 'agendada',
      origem: 'municipio',
    };
    this.consultas.update((lista) => [novo, ...lista]);
  }
}
