import { Injectable } from '@angular/core';
import { MenuItem, PerfilUsuario } from '../models';

const MENU: MenuItem[] = [
  { label: 'Dashboard', icon: 'space_dashboard', route: '/home', perfis: ['Administrador', 'GRAMB', 'GERES', 'Municipio', 'UnidadeExecutante'] },
  { label: 'Municípios', icon: 'location_city', route: '/municipios', perfis: ['Administrador', 'GRAMB', 'GERES'] },
  { label: 'Unidades Executantes', icon: 'local_hospital', route: '/unidades', perfis: ['Administrador', 'GRAMB', 'GERES', 'Municipio'] },
  { label: 'Minha Unidade', icon: 'local_hospital', route: '/minha-unidade', perfis: ['UnidadeExecutante'] },
  { label: 'Enviar Agenda', icon: 'upload_file', route: '/enviar-agenda', perfis: ['UnidadeExecutante'] },
  { label: 'Agendas Recebidas', icon: 'inbox', route: '/agendas-recebidas', perfis: ['Administrador', 'GRAMB', 'GERES'] },
  { label: 'Consultas', icon: 'event_available', route: '/consultas', perfis: ['Administrador', 'GRAMB', 'GERES', 'Municipio', 'UnidadeExecutante'] },
  { label: 'Painel de Vagas', icon: 'grid_view', route: '/painel-vagas', perfis: ['Administrador', 'GRAMB', 'GERES', 'Municipio', 'UnidadeExecutante'] },
  { label: 'Vagas Estratégicas', icon: 'star', route: '/vagas-estrategicas', perfis: ['Administrador', 'GRAMB'] },
  { label: 'Dashboard Analítico', icon: 'analytics', route: '/dashboard-analitico', perfis: ['Administrador', 'GRAMB', 'GERES'] },
  { label: 'Relatórios', icon: 'summarize', route: '/relatorios', perfis: ['Administrador', 'GRAMB', 'GERES'] },
  { label: 'Alertas', icon: 'campaign', route: '/alertas', perfis: ['Administrador', 'GRAMB', 'GERES', 'Municipio', 'UnidadeExecutante'] },
  { label: 'Auditoria', icon: 'fact_check', route: '/auditoria', perfis: ['Administrador'] },
  { label: 'Auditoria de Vagas', icon: 'history', route: '/auditoria-vagas', perfis: ['Administrador', 'GRAMB', 'GERES', 'Municipio', 'UnidadeExecutante'] },
  { label: 'Dados do CMCE', icon: 'cloud_upload', route: '/admin/cmce', perfis: ['Administrador'] },
  { label: 'Gerenciar Dashboards', icon: 'dashboard_customize', route: '/admin/dashboards', perfis: ['Administrador'] },
  { label: 'Configurações', icon: 'settings', route: '/configuracoes', perfis: ['Administrador', 'GRAMB', 'GERES', 'Municipio', 'UnidadeExecutante'] },
];

@Injectable({ providedIn: 'root' })
export class MenuService {
  itensPara(perfil: PerfilUsuario | null): MenuItem[] {
    if (!perfil) return [];
    return MENU.filter((item) => item.perfis.includes(perfil));
  }
}
