import { Agenda } from '../../models/agenda.model';

export interface DataComVagas {
  data: string;
  vagas: number;
}

export interface LinhaAgendaCompleta {
  profissionalNome: string;
  horarioInicio: string;
  diaSemana: 'Segunda-feira' | 'Terça-feira' | 'Quarta-feira' | 'Quinta-feira' | 'Sexta-feira';
  datas: DataComVagas[];
}

export interface AgendaCompletaGerada {
  hospitalNome: string;
  mesReferencia: string;
  especialidade: string;
  cbo: string;
  linhas: LinhaAgendaCompleta[];
  observacoes: string[];
}

const DIAS_SEMANA: LinhaAgendaCompleta['diaSemana'][] = [
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
];

const HORARIOS_POSSIVEIS = ['07:00', '08:00', '09:00', '10:00', '13:00', '14:00'];

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

/** CBO aproximado por especialidade, apenas para fins de exibição no espelho da agenda. */
const CBO_POR_ESPECIALIDADE: Record<string, string> = {
  Cardiologia: '225124 - Médico Cardiologista',
  Ortopedia: '225150 - Médico Ortopedista e Traumatologista',
  Dermatologia: '225106 - Médico Dermatologista',
  Ginecologia: '225129 - Médico Ginecologista e Obstetra',
  Oftalmologia: '225145 - Médico Oftalmologista',
  Endocrinologia: '225109 - Médico Endocrinologista e Metabologista',
  Neurologia: '225139 - Médico Neurologista',
  Pediatria: '225103 - Médico Pediatra',
  Urologia: '225160 - Médico Urologista',
  Psiquiatria: '225133 - Médico Psiquiatra',
  Otorrinolaringologia: '225151 - Médico Otorrinolaringologista',
  Pneumologia: '225115 - Médico Pneumologista',
  Gastroenterologia: '225118 - Médico Gastroenterologista',
  Reumatologia: '225155 - Médico Reumatologista',
  Oncologia: '225121 - Médico Cancerologista (Oncologista) Clínico',
  Fisioterapia: '223605 - Fisioterapeuta Geral',
  Nutrição: '223710 - Nutricionista',
  Fonoaudiologia: '223810 - Fonoaudiólogo Geral',
};

function hashTexto(texto: string): number {
  let hash = 0;
  for (let i = 0; i < texto.length; i++) {
    hash = (hash * 31 + texto.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function parseDataBr(dataBr: string): Date {
  const [d, m, a] = dataBr.split('/').map(Number);
  return new Date(a, m - 1, d);
}

function formatarDataBr(data: Date): string {
  const d = String(data.getDate()).padStart(2, '0');
  const m = String(data.getMonth() + 1).padStart(2, '0');
  return `${d}/${m}`;
}

/**
 * Reconstrói o "espelho" da agenda completa (layout semanal por profissional,
 * dia da semana e datas com quantidade de vagas) a partir dos campos já
 * estruturados no sistema, no mesmo formato do documento original enviado
 * pelas unidades executantes.
 */
export function gerarAgendaCompleta(agenda: Agenda): AgendaCompletaGerada {
  const [inicioStr, fimStr] = agenda.periodo.split(' a ').map((s) => s.trim());
  const inicio = parseDataBr(inicioStr);
  const fim = parseDataBr(fimStr ?? inicioStr);

  const hash = hashTexto(agenda.id + agenda.profissionalNome);
  const indiceDia = hash % DIAS_SEMANA.length;
  const diaSemana = DIAS_SEMANA[indiceDia];
  const horarioInicio = HORARIOS_POSSIVEIS[hash % HORARIOS_POSSIVEIS.length];
  // getDay(): 0=Domingo ... 6=Sábado. Segunda-feira deve corresponder a getDay() === 1.
  const getDayAlvo = indiceDia + 1;

  const datas: DataComVagas[] = [];
  const cursor = new Date(inicio);
  while (cursor <= fim) {
    if (cursor.getDay() === getDayAlvo) {
      datas.push({ data: formatarDataBr(cursor), vagas: 0 });
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  if (datas.length === 0) {
    datas.push({ data: formatarDataBr(inicio), vagas: 0 });
  }

  const base = Math.floor(agenda.vagasTotais / datas.length);
  const resto = agenda.vagasTotais % datas.length;
  datas.forEach((d, i) => {
    d.vagas = base + (i < resto ? 1 : 0);
  });

  const observacoes: string[] = [];
  if (agenda.observacaoFeriado) observacoes.push(agenda.observacaoFeriado);
  observacoes.push(...agenda.inconsistencias);
  if (agenda.motivoDevolucao) observacoes.push(`Devolução anterior: ${agenda.motivoDevolucao}`);

  return {
    hospitalNome: agenda.ueNome.toUpperCase(),
    mesReferencia: `${MESES[inicio.getMonth()]} – ${inicio.getFullYear()}`,
    especialidade: agenda.especialidade,
    cbo: CBO_POR_ESPECIALIDADE[agenda.especialidade] ?? 'Não informado pela unidade executante',
    linhas: [
      {
        profissionalNome: agenda.profissionalNome,
        horarioInicio,
        diaSemana,
        datas,
      },
    ],
    observacoes,
  };
}
