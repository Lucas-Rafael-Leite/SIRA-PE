export type StatusUE = 'ativa' | 'inativa' | 'manutencao';
export type NivelRegulacaoUE = 'central' | 'geres';

export interface UnidadeExecutante {
  id: string;
  nome: string;
  cnes: string;
  municipioId: string;
  municipioNome: string;
  geresId: string;
  geresNome: string;
  tipo: string;
  status: StatusUE;
  especialidades: string[];
  profissionaisQtd: number;
  vagasDisponiveis: number;
  vagasTotais: number;
  telefone: string;
  endereco: string;
  /** Indica se a regulação da UE é feita a nível central (GRAMB) ou por uma GERES. */
  nivelRegulacao: NivelRegulacaoUE;
  /** Nome do responsável técnico pela unidade (usado em telas de agenda/auditoria). */
  responsavelNome: string;
}
