export interface Paciente {
  id: string;
  nome: string;
  cpf: string;
  cartaoSus: string;
  dataNascimento: string;
  municipioId: string;
  municipioNome: string;
  telefone: string;
  /** Indica se o paciente ainda está na fila de espera por uma consulta. */
  emFilaDeEspera: boolean;
}
