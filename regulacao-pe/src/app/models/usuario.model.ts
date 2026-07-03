export type PerfilUsuario = 'Administrador' | 'GRAMB' | 'GERES' | 'Municipio' | 'UnidadeExecutante';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  perfil: PerfilUsuario;
  vinculoNome: string;
  avatarIniciais: string;
}
