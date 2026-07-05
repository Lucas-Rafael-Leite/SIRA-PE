import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { Breadcrumb } from '../../shared/components/breadcrumb/breadcrumb';
import { KpiCard } from '../../shared/components/kpi-card/kpi-card';
import { ChartCanvas } from '../../shared/components/chart/chart-canvas';
import {
  INDICADORES_GERAIS_MOCK,
  SERIE_CONSULTAS_MES,
  SERIE_ABSENTEISMO_ESPECIALIDADE,
  SERIE_STATUS_VAGAS,
  GERES_MOCK,
} from '../../mock';
import { nomeCurtoGeres } from '../../shared/utils/geres-nome.util';

const PALETA = ['#1451B4', '#00A859', '#F2B705', '#D32F2F', '#5B6472', '#6FA0F5', '#00703C'];

@Component({
  selector: 'app-dashboard-analitico',
  standalone: true,
  imports: [Breadcrumb, KpiCard, ChartCanvas],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="sira-page sira-fade-in">
      <app-breadcrumb [itens]="[{ label: 'Dashboard', route: '/home' }, { label: 'Dashboard Analítico' }]" />

      <div class="sira-page-header">
        <div class="sira-page-header__title">
          <span class="sira-eyebrow">Indicadores estratégicos</span>
          <h1>Dashboard Analítico</h1>
          <p>Indicadores consolidados de desempenho da regulação ambulatorial.</p>
        </div>
      </div>

      <div class="sira-grid sira-grid--kpi" style="margin-bottom:20px">
        <app-kpi-card label="Ocupação média" [value]="indicadores.ocupacaoMedia + '%'" icon="donut_large" tone="sus" />
        <app-kpi-card label="Ociosidade" [value]="indicadores.ociosidade + '%'" icon="hourglass_empty" tone="pending" />
        <app-kpi-card label="Fila ativa" [value]="fmt(indicadores.filaAtiva)" icon="groups" tone="alert" />
        <app-kpi-card label="Tempo médio de espera" [value]="indicadores.tempoMedioEsperaDias + ' dias'" icon="schedule" tone="primary" />
      </div>

      <div class="sira-grid sira-grid--2" style="margin-bottom:20px">
        <div class="sira-card panel">
          <h3>Consultas: agendadas x realizadas</h3>
          <app-chart-canvas [config]="chartLinha" [altura]="260" />
        </div>
        <div class="sira-card panel">
          <h3>Absenteísmo por especialidade</h3>
          <app-chart-canvas [config]="chartRadar" [altura]="260" />
        </div>
      </div>

      <div class="sira-grid sira-grid--2" style="margin-bottom:20px">
        <div class="sira-card panel">
          <h3>Distribuição de vagas por status</h3>
          <app-chart-canvas [config]="chartPizza" [altura]="260" />
        </div>
        <div class="sira-card panel">
          <h3>Consultas por GERES</h3>
          <app-chart-canvas [config]="chartBarra" [altura]="260" />
        </div>
      </div>

      <div class="sira-card panel">
        <h3>Indicador geral por GERES (área)</h3>
        <p class="explicacao-indicador">
          <span class="material-icons-round">info</span>
          O <strong>indicador geral</strong> é um índice de 0 a 100 que resume a ocupação de agenda,
          o absenteísmo e o tempo médio de espera de cada GERES em um único número — quanto mais
          próximo de 100, melhor o desempenho da regulação naquela região.
        </p>
        <app-chart-canvas [config]="chartArea" [altura]="260" />
      </div>
    </div>
  `,
  styleUrl: './dashboard-analitico.scss',
})
export class DashboardAnalitico {
  indicadores = INDICADORES_GERAIS_MOCK;

  chartLinha: ChartConfiguration = {
    type: 'line',
    data: {
      labels: SERIE_CONSULTAS_MES.labels,
      datasets: [
        { label: 'Realizadas', data: SERIE_CONSULTAS_MES.realizadas, borderColor: '#00A859', backgroundColor: 'rgba(0,168,89,0.12)', tension: 0.35, fill: true },
        { label: 'Agendadas', data: SERIE_CONSULTAS_MES.agendadas, borderColor: '#1451B4', backgroundColor: 'rgba(20,81,180,0.08)', tension: 0.35, fill: true },
      ],
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } }, scales: { y: { beginAtZero: true } } },
  };

  chartRadar: ChartConfiguration = {
    type: 'radar',
    data: {
      labels: SERIE_ABSENTEISMO_ESPECIALIDADE.labels,
      datasets: [
        {
          label: 'Absenteísmo (%)',
          data: SERIE_ABSENTEISMO_ESPECIALIDADE.valores,
          borderColor: '#D32F2F',
          backgroundColor: 'rgba(211,47,47,0.18)',
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { r: { beginAtZero: true, ticks: { stepSize: 5 } } },
    },
  };

  chartPizza: ChartConfiguration = {
    type: 'doughnut',
    data: {
      labels: SERIE_STATUS_VAGAS.labels,
      datasets: [{ data: SERIE_STATUS_VAGAS.valores, backgroundColor: PALETA }],
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } } },
  };

  chartBarra: ChartConfiguration = {
    type: 'bar',
    data: {
      labels: GERES_MOCK.map((g) => nomeCurtoGeres(g.nome)),
      datasets: [{ label: 'Consultas/mês', data: GERES_MOCK.map((g) => g.consultasMes), backgroundColor: '#1451B4', borderRadius: 6 }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { x: { ticks: { autoSkip: false, maxRotation: 60, minRotation: 40 } } },
    },
  };

  chartArea: ChartConfiguration = {
    type: 'line',
    data: {
      labels: GERES_MOCK.map((g) => nomeCurtoGeres(g.nome)),
      datasets: [
        {
          label: 'Indicador geral',
          data: GERES_MOCK.map((g) => g.indicadorGeral),
          borderColor: '#00A859',
          backgroundColor: 'rgba(0,168,89,0.18)',
          fill: true,
          tension: 0.3,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, max: 100 } },
    },
  };

  fmt(v: number): string {
    return v.toLocaleString('pt-BR');
  }
}
