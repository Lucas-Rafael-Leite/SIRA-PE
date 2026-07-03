export interface RegistroAuditoria {
  id: string;
  usuario: string;
  perfil: string;
  operacao: string;
  modulo: string;
  data: string;
  antes?: string;
  depois?: string;
  ip: string;
}
