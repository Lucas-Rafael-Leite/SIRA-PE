import { Usuario } from '../models/usuario.model';

export const USUARIOS_MOCK: Usuario[] = [
  { id: 'usr-adm', nome: 'Camila Andrade', email: 'camila.andrade@saude.pe.gov.br', perfil: 'Administrador', vinculoNome: 'SES-PE', vinculoId: null, avatarIniciais: 'CA' },
  { id: 'usr-gramb', nome: 'Roberto Nunes', email: 'roberto.nunes@saude.pe.gov.br', perfil: 'GRAMB', vinculoNome: 'GRAMB - Regulação Estadual', vinculoId: null, avatarIniciais: 'RN' },
  { id: 'usr-geres', nome: 'Patrícia Lima', email: 'patricia.lima@saude.pe.gov.br', perfil: 'GERES', vinculoNome: 'IV GERES - Caruaru', vinculoId: 'ger-04', avatarIniciais: 'PL' },
  { id: 'usr-mun', nome: 'Eduardo Barros', email: 'eduardo.barros@caruaru.pe.gov.br', perfil: 'Municipio', vinculoNome: 'Caruaru', vinculoId: 'mun-017', avatarIniciais: 'EB' },
  { id: 'usr-ue', nome: 'Larissa Farias', email: 'larissa.farias@ue.pe.gov.br', perfil: 'UnidadeExecutante', vinculoNome: 'Ambulatório Municipal Caruaru', vinculoId: 'ue-017', avatarIniciais: 'LF' },
];
