import { IndicadoresGerais } from '../models/indicador.model';

export const INDICADORES_GERAIS_MOCK: IndicadoresGerais = {
  totalConsultasMes: 96380,
  totalVagasDisponiveis: 14260,
  absenteismoMedio: 14.8,
  tempoMedioEsperaDias: 23,
  ocupacaoMedia: 81.4,
  ociosidade: 9.6,
  filaAtiva: 38940,
};

export const SERIE_CONSULTAS_MES = {
  labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul'],
  realizadas: [78200, 81340, 85670, 88920, 91410, 94870, 62310],
  agendadas: [82100, 85990, 89230, 92110, 95870, 98430, 96380],
};

export const SERIE_ABSENTEISMO_ESPECIALIDADE = {
  labels: ['Cardiologia', 'Ortopedia', 'Dermatologia', 'Oftalmologia', 'Ginecologia', 'Endocrinologia'],
  valores: [12.4, 18.9, 9.2, 15.6, 11.3, 16.8],
};

export const SERIE_STATUS_VAGAS = {
  labels: ['Disponível', 'Agendada', 'Bloqueada', 'Realizada', 'Cancelada'],
  valores: [3480, 5210, 980, 3920, 670],
};
