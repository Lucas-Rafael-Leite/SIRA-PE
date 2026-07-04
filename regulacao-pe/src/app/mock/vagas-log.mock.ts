import { LogVaga } from '../models/vaga.model';

export const LOGS_VAGA_MOCK: LogVaga[] = [
  { id: 'lv-0001', vagaId: 'vg-00002', tipo: 'visualizacao', usuario: 'Eduardo Barros', perfil: 'Municipio', data: '28/06/2026 09:14', detalhe: 'Visualizou os detalhes da vaga.' },
  { id: 'lv-0002', vagaId: 'vg-00002', tipo: 'marcacao', usuario: 'Eduardo Barros', perfil: 'Municipio', data: '28/06/2026 09:20', detalhe: 'Marcou a consulta do paciente nesta vaga.' },
  { id: 'lv-0003', vagaId: 'vg-00020', tipo: 'marcacao', usuario: 'Larissa Farias', perfil: 'UnidadeExecutante', data: '20/06/2026 10:02', detalhe: 'Vaga marcada com paciente.' },
  { id: 'lv-0004', vagaId: 'vg-00020', tipo: 'cancelamento', usuario: 'Patrícia Lima', perfil: 'GERES', data: '25/06/2026 15:40', detalhe: 'Consulta cancelada; vaga retornou para disponível.' },
  { id: 'lv-0005', vagaId: 'vg-00020', tipo: 'liberacao', usuario: 'Sistema SIRA-PE', perfil: 'Administrador', data: '25/06/2026 15:40', detalhe: 'Vaga liberada automaticamente após cancelamento.' },
  { id: 'lv-0006', vagaId: 'vg-00003', tipo: 'visualizacao', usuario: 'Roberto Nunes', perfil: 'GRAMB', data: '30/06/2026 11:05', detalhe: 'Visualizou os detalhes da vaga.' },
];
