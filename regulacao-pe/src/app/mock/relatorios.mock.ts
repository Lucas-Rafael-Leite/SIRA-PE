import { Relatorio } from '../models/relatorio.model';

export const RELATORIOS_MOCK: Relatorio[] = [
  { id: 'rel-001', nome: 'Consultas realizadas - Junho/2026', tipo: 'Consultas', geradoEm: '01/07/2026', geradoPor: 'GRAMB', formato: 'PDF', tamanho: '2.4 MB' },
  { id: 'rel-002', nome: 'Ocupação de vagas por GERES', tipo: 'Vagas', geradoEm: '28/06/2026', geradoPor: 'GRAMB', formato: 'Excel', tamanho: '1.1 MB' },
  { id: 'rel-003', nome: 'Absenteísmo por especialidade', tipo: 'Indicadores', geradoEm: '25/06/2026', geradoPor: 'Administrador', formato: 'PDF', tamanho: '890 KB' },
  { id: 'rel-004', nome: 'Auditoria de operações - Maio/2026', tipo: 'Auditoria', geradoEm: '02/06/2026', geradoPor: 'Administrador', formato: 'CSV', tamanho: '640 KB' },
  { id: 'rel-005', nome: 'Ranking de desempenho das GERES', tipo: 'Indicadores', geradoEm: '30/06/2026', geradoPor: 'GRAMB', formato: 'PDF', tamanho: '1.8 MB' },
  { id: 'rel-006', nome: 'Vagas estratégicas utilizadas', tipo: 'Vagas', geradoEm: '20/06/2026', geradoPor: 'GERES', formato: 'Excel', tamanho: '540 KB' },
  { id: 'rel-007', nome: 'Alertas emitidos - 2º trimestre', tipo: 'Alertas', geradoEm: '18/06/2026', geradoPor: 'GRAMB', formato: 'PDF', tamanho: '760 KB' },
  { id: 'rel-008', nome: 'Agendas com inconsistências', tipo: 'Agendas', geradoEm: '15/06/2026', geradoPor: 'Município', formato: 'CSV', tamanho: '310 KB' },
];
