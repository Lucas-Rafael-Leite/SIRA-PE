import { PerfilUsuario } from './usuario.model';

export type PrioridadeAlerta = 'baixa' | 'media' | 'alta' | 'critica';

export interface Alerta {
  id: string;
  titulo: string;
  mensagem: string;
  destino: 'municipio' | 'geres' | 'ue';
  destinoId: string;
  destinoNome: string;
  prioridade: PrioridadeAlerta;
  dataEnvio: string;
  autor: string;
  autorPerfil: PerfilUsuario;
  lido: boolean;
}
