import { Injectable } from '@angular/core';
import { MenuItem, PerfilUsuario } from '../models';

const MENU: MenuItem[] = [
  { label: 'Dashboard', icon: 'space_dashboard', route: '/home', perfis: ['Administrador', 'GRAMB', 'GERES', 'Municipio', 'UnidadeExecutante'] },
  { label: 'Municípios', icon: 'location_city', route: '/municipios', perfis: ['Administrador', 'GRAMB', 'GERES'] },
  { label: 'Unidades Executantes', icon: 'local_hospital', route: '/unidades', perfis: ['Administrador', 'GRAMB', 'GERES', 'Municipio'] },
  { label: 'Consultas', icon: 'event_available', route: '/consultas', perfis: ['Administrador', 'GRAMB', 'GERES', 'Municipio', 'UnidadeExecutante'] },
  { label: 'Painel de Vagas', icon: 'grid_view', route: '/painel-vagas', perfis: ['Administrador', 'GRAMB', 'GERES', 'Municipio', 'UnidadeExecutante'] },
  { label: 'Dashboard Analítico', icon: 'monitoring', route: '/dashboard-analitico', perfis: ['Administrador', 'GRAMB', 'GERES'] },
  { label: 'Relatórios', icon: 'summarize', route: '/relatorios', perfis: ['Administrador', 'GRAMB', 'GERES', 'Municipio'] },
  { label: 'Alertas', icon: 'campaign', route: '/alertas', perfis: ['Administrador', 'GRAMB', 'GERES', 'Municipio', 'UnidadeExecutante'] },
  { label: 'Auditoria', icon: 'fact_check', route: '/auditoria', perfis: ['Administrador', 'GRAMB'] },
  { label: 'Configurações', icon: 'settings', route: '/configuracoes', perfis: ['Administrador', 'GRAMB', 'GERES', 'Municipio', 'UnidadeExecutante'] },
];

@Injectable({ providedIn: 'root' })
export class MenuService {
  itensPara(perfil: PerfilUsuario | null): MenuItem[] {
    if (!perfil) return [];
    return MENU.filter((item) => item.perfis.includes(perfil));
  }
}
