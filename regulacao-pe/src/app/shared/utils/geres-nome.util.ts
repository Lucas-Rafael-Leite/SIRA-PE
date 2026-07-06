/**
 * Formata o nome de uma GERES para exibição resumida em dashboards e gráficos,
 * ex.: "IV GERES - Caruaru" -> "IV GERES" (sem expor o nome da cidade-sede).
 */
export function nomeCurtoGeres(nome: string): string {
  return nome.split(' - ')[0].trim();
}
