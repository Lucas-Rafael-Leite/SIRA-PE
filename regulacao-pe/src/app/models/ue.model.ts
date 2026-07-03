export type StatusUE = 'ativa' | 'inativa' | 'manutencao';

export interface UnidadeExecutante {
  id: string;
  nome: string;
  cnes: string;
  municipioId: string;
  municipioNome: string;
  geresNome: string;
  tipo: string;
  status: StatusUE;
  especialidades: string[];
  profissionaisQtd: number;
  vagasDisponiveis: number;
  vagasTotais: number;
  telefone: string;
  endereco: string;
}
