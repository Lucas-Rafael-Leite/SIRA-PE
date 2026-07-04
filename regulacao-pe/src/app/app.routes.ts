import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { perfilGuard } from './core/guards/perfil.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
  },
  {
    path: '',
    loadComponent: () => import('./layout/main-layout/main-layout').then((m) => m.MainLayout),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', loadComponent: () => import('./pages/home/home').then((m) => m.Home) },
      {
        path: 'municipios',
        canActivate: [perfilGuard(['Administrador', 'GRAMB', 'GERES'])],
        loadComponent: () => import('./pages/municipios/municipios').then((m) => m.Municipios),
      },
      {
        path: 'municipios/:id',
        canActivate: [perfilGuard(['Administrador', 'GRAMB', 'GERES'])],
        loadComponent: () =>
          import('./pages/municipio-detalhe/municipio-detalhe').then((m) => m.MunicipioDetalhe),
      },
      {
        path: 'unidades',
        canActivate: [perfilGuard(['Administrador', 'GRAMB', 'GERES', 'Municipio'])],
        loadComponent: () => import('./pages/unidades/unidades').then((m) => m.Unidades),
      },
      {
        path: 'unidades/:id',
        canActivate: [perfilGuard(['Administrador', 'GRAMB', 'GERES', 'Municipio'])],
        loadComponent: () =>
          import('./pages/unidade-detalhe/unidade-detalhe').then((m) => m.UnidadeDetalhe),
      },
      {
        path: 'minha-unidade',
        canActivate: [perfilGuard(['UnidadeExecutante'])],
        loadComponent: () =>
          import('./pages/unidade-detalhe/unidade-detalhe').then((m) => m.UnidadeDetalhe),
      },
      {
        path: 'enviar-agenda',
        canActivate: [perfilGuard(['UnidadeExecutante'])],
        loadComponent: () => import('./pages/enviar-agenda/enviar-agenda').then((m) => m.EnviarAgenda),
      },
      {
        path: 'agendas-recebidas',
        canActivate: [perfilGuard(['Administrador', 'GRAMB', 'GERES'])],
        loadComponent: () =>
          import('./pages/agendas-recebidas/agendas-recebidas').then((m) => m.AgendasRecebidas),
      },
      {
        path: 'consultas',
        loadComponent: () => import('./pages/consultas/consultas').then((m) => m.Consultas),
      },
      {
        path: 'painel-vagas',
        loadComponent: () => import('./pages/painel-vagas/painel-vagas').then((m) => m.PainelVagas),
      },
      {
        path: 'dashboard-analitico',
        canActivate: [perfilGuard(['Administrador', 'GRAMB', 'GERES'])],
        loadComponent: () =>
          import('./pages/dashboard-analitico/dashboard-analitico').then((m) => m.DashboardAnalitico),
      },
      {
        path: 'relatorios',
        canActivate: [perfilGuard(['Administrador', 'GRAMB', 'GERES'])],
        loadComponent: () => import('./pages/relatorios/relatorios').then((m) => m.Relatorios),
      },
      {
        path: 'alertas',
        loadComponent: () => import('./pages/alertas/alertas').then((m) => m.Alertas),
      },
      {
        path: 'auditoria',
        canActivate: [perfilGuard(['Administrador'])],
        loadComponent: () => import('./pages/auditoria/auditoria').then((m) => m.Auditoria),
      },
      {
        path: 'auditoria-vagas',
        loadComponent: () =>
          import('./pages/auditoria-vagas/auditoria-vagas').then((m) => m.AuditoriaVagas),
      },
      {
        path: 'admin/cmce',
        canActivate: [perfilGuard(['Administrador'])],
        loadComponent: () =>
          import('./pages/admin/cmce-import/cmce-import').then((m) => m.CmceImport),
      },
      {
        path: 'admin/dashboards',
        canActivate: [perfilGuard(['Administrador'])],
        loadComponent: () =>
          import('./pages/admin/gerenciar-dashboards/gerenciar-dashboards').then(
            (m) => m.GerenciarDashboards,
          ),
      },
      {
        path: 'configuracoes',
        loadComponent: () =>
          import('./pages/configuracoes/configuracoes').then((m) => m.Configuracoes),
      },
    ],
  },
  { path: '**', redirectTo: 'home' },
];
