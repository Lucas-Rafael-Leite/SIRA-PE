export type PerfilUsuario = 'Administrador' | 'GRAMB' | 'GERES' | 'Municipio' | 'UnidadeExecutante';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  perfil: PerfilUsuario;
  vinculoNome: string;
  /** ID da GERES/Município/UE vinculada (geresId, municipioId ou ueId). Usado para escopo de dados. */
  vinculoId: string | null;
  avatarIniciais: string;
}
