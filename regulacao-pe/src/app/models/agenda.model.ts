export type StatusAgenda = 'pendente' | 'validada' | 'com_inconsistencias' | 'publicada';

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
}
