export interface Profissional {
  id: string;
  nome: string;
  conselho: string;
  numeroConselho: string;
  especialidade: string;
  ueId: string;
  ueNome: string;
  cargaHorariaSemanal: number;
  status: 'ativo' | 'afastado' | 'inativo';
}
