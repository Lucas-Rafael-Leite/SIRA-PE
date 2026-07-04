import { Injectable, signal } from '@angular/core';

export interface WidgetDashboard {
  id: string;
  nome: string;
  descricao: string;
  visivel: boolean;
}

const WIDGETS_INICIAIS: WidgetDashboard[] = [
  { id: 'kpis', nome: 'Cards de indicadores (KPIs)', descricao: 'Consultas, vagas, absenteísmo e tempo de espera.', visivel: true },
  { id: 'grafico-consultas', nome: 'Gráfico de consultas', descricao: 'Agendadas x realizadas nos últimos meses.', visivel: true },
  { id: 'ranking-geres', nome: 'Ranking das GERES', descricao: 'Classificação por indicador geral.', visivel: true },
  { id: 'ultimos-alertas', nome: 'Últimos alertas', descricao: 'Lista dos alertas mais recentes.', visivel: true },
  { id: 'ultimas-consultas', nome: 'Últimas consultas/agendas', descricao: 'Atividade recente de agendamento.', visivel: true },
];

/** Permite ao Administrador ligar/desligar widgets exibidos no Dashboard geral (Home). */
@Injectable({ providedIn: 'root' })
export class DashboardConfigService {
  private readonly widgets = signal<WidgetDashboard[]>([...WIDGETS_INICIAIS]);

  listar() {
    return this.widgets;
  }

  estaVisivel(id: string): boolean {
    return this.widgets().find((w) => w.id === id)?.visivel ?? true;
  }

  alternar(id: string): void {
    this.widgets.update((lista) => lista.map((w) => (w.id === id ? { ...w, visivel: !w.visivel } : w)));
  }
}
