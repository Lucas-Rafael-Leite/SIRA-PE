import { PerfilUsuario } from './usuario.model';

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

/** Assinatura de alerta: qualquer perfil pode pedir para ser notificado quando uma vaga da especialidade vagar. */
export interface AlertaDisponibilidadeVaga {
  id: string;
  criadoPorNome: string;
  perfilCriador: PerfilUsuario;
  /** Nome do recorte de interesse (UE, município, GERES ou "Estado de Pernambuco"). */
  escopoNome: string;
  especialidade: string;
  criadoEm: string;
  ativo: boolean;
}

export type TipoLogVaga = 'visualizacao' | 'marcacao' | 'desmarcacao' | 'cancelamento' | 'liberacao';

export interface LogVaga {
  id: string;
  vagaId: string;
  tipo: TipoLogVaga;
  usuario: string;
  perfil: PerfilUsuario;
  data: string;
  detalhe: string;
}
