import { PerfilUsuario } from './usuario.model';

export interface MenuItem {
  label: string;
  icon: string;
  route?: string;
  perfis: PerfilUsuario[];
  badge?: number;
}
