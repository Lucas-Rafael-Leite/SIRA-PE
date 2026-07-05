export interface Geres {
  id: string;
  nome: string;
  sede: string;
  municipiosQtd: number;
  uesQtd: number;
  consultasMes: number;
  ranking: number;
  indicadorGeral: number; // 0-100
  /** Vagas disponíveis somadas nas UEs sob responsabilidade da GERES. */
  vagasDisponiveis: number;
  /** Absenteísmo médio (%) dos municípios sob responsabilidade da GERES. */
  absenteismoMedio: number;
  /** Tempo médio de espera (dias) para consulta na GERES. */
  tempoMedioEsperaDias: number;
}
