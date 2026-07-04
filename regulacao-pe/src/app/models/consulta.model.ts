export type StatusConsulta = 'agendada' | 'confirmada' | 'realizada' | 'cancelada' | 'faltou';

export interface Consulta {
  id: string;
  protocolo: string;
  pacienteId: string;
  pacienteNome: string;
  especialidade: string;
  ueId: string;
  ueNome: string;
  municipioNome: string;
  profissionalNome: string;
  data: string;
  hora: string;
  status: StatusConsulta;
  origem: 'municipio' | 'ue' | 'geres';
  /** Referência à vaga original (quando a consulta foi criada a partir do Painel de Vagas). */
  vagaId?: string;
}
