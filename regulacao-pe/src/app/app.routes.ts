import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

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
        loadComponent: () => import('./pages/municipios/municipios').then((m) => m.Municipios),
      },
      {
        path: 'municipios/:id',
        loadComponent: () =>
          import('./pages/municipio-detalhe/municipio-detalhe').then((m) => m.MunicipioDetalhe),
      },
      {
        path: 'unidades',
        loadComponent: () => import('./pages/unidades/unidades').then((m) => m.Unidades),
      },
      {
        path: 'unidades/:id',
        loadComponent: () =>
          import('./pages/unidade-detalhe/unidade-detalhe').then((m) => m.UnidadeDetalhe),
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
        loadComponent: () =>
          import('./pages/dashboard-analitico/dashboard-analitico').then((m) => m.DashboardAnalitico),
      },
      {
        path: 'relatorios',
        loadComponent: () => import('./pages/relatorios/relatorios').then((m) => m.Relatorios),
      },
      {
        path: 'alertas',
        loadComponent: () => import('./pages/alertas/alertas').then((m) => m.Alertas),
      },
      {
        path: 'auditoria',
        loadComponent: () => import('./pages/auditoria/auditoria').then((m) => m.Auditoria),
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
