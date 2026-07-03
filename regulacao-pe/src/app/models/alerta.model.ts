export type PrioridadeAlerta = 'baixa' | 'media' | 'alta' | 'critica';

export interface Alerta {
  id: string;
  titulo: string;
  mensagem: string;
  destino: 'municipio' | 'geres' | 'ue';
  destinoNome: string;
  prioridade: PrioridadeAlerta;
  dataEnvio: string;
  autor: string;
  lido: boolean;
}
