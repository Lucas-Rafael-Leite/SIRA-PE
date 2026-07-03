export interface Relatorio {
  id: string;
  nome: string;
  tipo: string;
  geradoEm: string;
  geradoPor: string;
  formato: 'PDF' | 'Excel' | 'CSV';
  tamanho: string;
}
