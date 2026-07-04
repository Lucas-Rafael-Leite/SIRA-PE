export type StatusVaga = 'disponivel' | 'agendada' | 'bloqueada' | 'realizada' | 'cancelada';

export interface Vaga {
  id: string;
  agendaId: string;
  ueId: string;
  ueNome: string;
  municipioNome: string;
  geresNome: string;
  especialidade: string;
  profissionalNome: string;
  data: string;
  hora: string;
  status: StatusVaga;
  estrategica: boolean;
  pacienteNome?: string;
}

/** Assinatura de alerta: a UE pede para ser notificada quando uma vaga da especialidade vagar. */
export interface AlertaDisponibilidadeVaga {
  id: string;
  ueId: string;
  ueNome: string;
  especialidade: string;
  criadoEm: string;
  ativo: boolean;
}
