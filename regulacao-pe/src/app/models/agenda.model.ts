export type StatusAgenda = 'pendente' | 'validada' | 'com_inconsistencias' | 'publicada' | 'devolvida';

export interface Agenda {
  id: string;
  ueId: string;
  ueNome: string;
  municipioNome: string;
  geresNome: string;
  responsavelUeNome: string;
  especialidade: string;
  profissionalNome: string;
  periodo: string;
  vagasTotais: number;
  vagasDisponiveis: number;
  status: StatusAgenda;
  enviadaPor: string;
  dataEnvio: string;
  inconsistencias: string[];
  /** Indica se há um feriado dentro do período informado (substitui a antiga observação de CNES). */
  observacaoFeriado: string | null;
  /** Motivo informado por quem devolveu a agenda (GERES/GRAMB/Administrador). */
  motivoDevolucao?: string | null;
  /** Quantas vezes esta agenda já precisou ser reenviada após devolução. */
  vezesReenviada: number;
}
