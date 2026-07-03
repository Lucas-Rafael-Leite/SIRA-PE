export interface IndicadorSerie {
  label: string;
  valores: number[];
}

export interface IndicadoresGerais {
  totalConsultasMes: number;
  totalVagasDisponiveis: number;
  absenteismoMedio: number;
  tempoMedioEsperaDias: number;
  ocupacaoMedia: number;
  ociosidade: number;
  filaAtiva: number;
}
