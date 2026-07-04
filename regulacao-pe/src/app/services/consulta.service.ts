import { Injectable, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { Consulta, Usuario } from '../models';
import { CONSULTAS_MOCK } from '../mock';
import { comLatencia } from './base-mock.service';
import { VagaService } from './vaga.service';
import { PacienteService } from './paciente.service';
import { VagaLogService } from './vaga-log.service';

export interface MarcacaoConsultaPayload {
  vagaId: string;
  pacienteId: string;
  pacienteNome: string;
  especialidade: string;
  ueId: string;
  ueNome: string;
  municipioNome: string;
  profissionalNome: string;
  data: string;
  hora: string;
}

@Injectable({ providedIn: 'root' })
export class ConsultaService {
  private readonly consultas = signal<Consulta[]>([...CONSULTAS_MOCK]);

  private vagaService = inject(VagaService);
  private pacienteService = inject(PacienteService);
  private vagaLogService = inject(VagaLogService);

  listar(): Observable<Consulta[]> {
    return comLatencia(this.consultas());
  }

  cancelar(id: string, motivo: string, autor: Usuario | null): void {
    const consulta = this.consultas().find((c) => c.id === id);
    this.consultas.update((lista) =>
      lista.map((c) => (c.id === id ? { ...c, status: 'cancelada' as const } : c)),
    );

    if (consulta?.vagaId) {
      this.vagaService.cancelar(consulta.vagaId);
      this.vagaLogService.registrar(
        consulta.vagaId,
        'desmarcacao',
        autor,
        `Consulta de ${consulta.pacienteNome} cancelada (${motivo || 'sem motivo informado'}). Vaga liberada.`,
      );
    }
  }

  /**
   * Fluxo completo de marcação: cria a consulta, marca a vaga com o paciente,
   * remove o paciente da fila de espera e registra o log de marcação da vaga.
   */
  marcarComVaga(payload: MarcacaoConsultaPayload, autor: Usuario | null): void {
    const novo: Consulta = {
      id: `cons-${Math.floor(Math.random() * 90000 + 10000)}`,
      protocolo: `PE${Math.floor(Math.random() * 900000 + 100000)}`,
      pacienteId: payload.pacienteId,
      pacienteNome: payload.pacienteNome,
      especialidade: payload.especialidade,
      ueId: payload.ueId,
      ueNome: payload.ueNome,
      municipioNome: payload.municipioNome,
      profissionalNome: payload.profissionalNome,
      data: payload.data,
      hora: payload.hora,
      status: 'agendada',
      origem: autor?.perfil === 'UnidadeExecutante' ? 'ue' : autor?.perfil === 'GERES' ? 'geres' : 'municipio',
      vagaId: payload.vagaId,
    };
    this.consultas.update((lista) => [novo, ...lista]);

    this.vagaService.marcarComPaciente(payload.vagaId, payload.pacienteNome);
    this.pacienteService.removerDaFila(payload.pacienteId);
    this.vagaLogService.registrar(
      payload.vagaId,
      'marcacao',
      autor,
      `Consulta marcada para ${payload.pacienteNome} (protocolo ${novo.protocolo}).`,
    );
  }
}
