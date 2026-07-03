import { Usuario } from '../models/usuario.model';

export const USUARIOS_MOCK: Usuario[] = [
  { id: 'usr-adm', nome: 'Camila Andrade', email: 'camila.andrade@saude.pe.gov.br', perfil: 'Administrador', vinculoNome: 'SES-PE', avatarIniciais: 'CA' },
  { id: 'usr-gramb', nome: 'Roberto Nunes', email: 'roberto.nunes@saude.pe.gov.br', perfil: 'GRAMB', vinculoNome: 'GRAMB - Regulação Estadual', avatarIniciais: 'RN' },
  { id: 'usr-geres', nome: 'Patrícia Lima', email: 'patricia.lima@saude.pe.gov.br', perfil: 'GERES', vinculoNome: 'IV GERES - Caruaru', avatarIniciais: 'PL' },
  { id: 'usr-mun', nome: 'Eduardo Barros', email: 'eduardo.barros@caruaru.pe.gov.br', perfil: 'Municipio', vinculoNome: 'Caruaru', avatarIniciais: 'EB' },
  { id: 'usr-ue', nome: 'Larissa Farias', email: 'larissa.farias@ue.pe.gov.br', perfil: 'UnidadeExecutante', vinculoNome: 'Policlínica Caruaru', avatarIniciais: 'LF' },
];
