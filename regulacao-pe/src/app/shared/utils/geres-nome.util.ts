/**
 * Formata o nome de uma GERES para exibição resumida em dashboards e gráficos,
 * ex.: "IV GERES - Caruaru" -> "GERES IV" (sem expor o nome da cidade-sede).
 */
export function nomeCurtoGeres(nome: string): string {
  const numeral = nome.split(' - ')[0].replace(/GERES/i, '').trim();
  return `GERES ${numeral}`;
}
