import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ChartConfiguration } from 'chart.js';
import { KpiCard } from '../../shared/components/kpi-card/kpi-card';
import { ChartCanvas } from '../../shared/components/chart/chart-canvas';
import { StatusBadge } from '../../shared/components/status-badge/status-badge';
import { LoadingSkeleton } from '../../shared/components/loading-skeleton/loading-skeleton';
import { AuthService } from '../../core/services/auth.service';
import { GeresService } from '../../services/geres.service';
import { AlertaService } from '../../services/alerta.service';
import { ConsultaService } from '../../services/consulta.service';
import { INDICADORES_GERAIS_MOCK, SERIE_CONSULTAS_MES } from '../../mock';
import { Geres, Alerta, Consulta } from '../../models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, KpiCard, ChartCanvas, StatusBadge, LoadingSkeleton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="sira-page sira-fade-in">
      <div class="sira-page-header">
        <div class="sira-page-header__title">
          <span class="sira-eyebrow">Painel geral</span>
          <h1>Olá, {{ primeiroNome() }} 👋</h1>
          <p>Visão consolidada da regulação ambulatorial em Pernambuco.</p>
        </div>
      </div>

      <div class="sira-grid sira-grid--kpi" style="margin-bottom: 20px">
        <app-kpi-card label="Consultas no mês" [value]="fmt(indicadores.totalConsultasMes)" icon="event_available" tone="primary" trend="alta" trendLabel="+4,8% vs. mês anterior" />
        <app-kpi-card label="Vagas disponíveis" [value]="fmt(indicadores.totalVagasDisponiveis)" icon="event_seat" tone="sus" trend="estavel" trendLabel="Estável na semana" />
        <app-kpi-card label="Absenteísmo médio" [value]="indicadores.absenteismoMedio + '%'" icon="person_off" tone="pending" trend="baixa" trendLabel="-1,2 p.p. no mês" />
        <app-kpi-card label="Tempo médio de espera" [value]="indicadores.tempoMedioEsperaDias + ' dias'" icon="hourglass_top" tone="alert" trend="alta" trendLabel="+2 dias vs. meta" />
      </div>

      <div class="sira-grid sira-grid--2" style="margin-bottom: 20px">
        <div class="sira-card panel">
          <div class="panel__header">
            <h3>Consultas: agendadas x realizadas</h3>
            <span class="sira-eyebrow">Últimos 7 meses</span>
          </div>
          <app-chart-canvas [config]="chartConsultas" [altura]="260" />
        </div>

        <div class="sira-card panel">
          <div class="panel__header">
            <h3>Ranking das GERES</h3>
            <a routerLink="/dashboard-analitico">Ver dashboard completo</a>
          </div>
          <div class="ranking-list">
            @for (g of geresOrdenadas(); track g.id) {
              <div class="ranking-item">
                <span class="ranking-item__pos">{{ g.ranking }}º</span>
                <div class="ranking-item__info">
                  <strong>{{ g.nome }}</strong>
                  <span>{{ fmt(g.consultasMes) }} consultas/mês</span>
                </div>
                <div class="ranking-item__bar">
                  <div class="ranking-item__bar-fill" [style.width.%]="g.indicadorGeral"></div>
                </div>
                <span class="ranking-item__valor">{{ g.indicadorGeral }}</span>
              </div>
            }
          </div>
        </div>
      </div>

      <div class="sira-grid sira-grid--2">
        <div class="sira-card panel">
          <div class="panel__header">
            <h3>Últimos alertas</h3>
            <a routerLink="/alertas">Ver todos</a>
          </div>
          @if (carregandoAlertas()) {
            <app-loading-skeleton variante="linha" [quantidade]="4" />
          } @else {
            <div class="alert-list">
              @for (a of ultimosAlertas(); track a.id) {
                <div class="alert-list__item">
                  <span class="material-icons-round alert-list__icon" [class]="'alert-list__icon--' + a.prioridade">campaign</span>
                  <div class="alert-list__body">
                    <strong>{{ a.titulo }}</strong>
                    <span>{{ a.destinoNome }} · {{ a.dataEnvio }}</span>
                  </div>
                  <app-status-badge [status]="a.prioridade" />
                </div>
              }
            </div>
          }
        </div>

        <div class="sira-card panel">
          <div class="panel__header">
            <h3>Últimas agendas / consultas</h3>
            <a routerLink="/consultas">Ver todas</a>
          </div>
          @if (carregandoConsultas()) {
            <app-loading-skeleton variante="linha" [quantidade]="4" />
          } @else {
            <div class="alert-list">
              @for (c of ultimasConsultas(); track c.id) {
                <div class="alert-list__item">
                  <span class="material-icons-round alert-list__icon alert-list__icon--info">event</span>
                  <div class="alert-list__body">
                    <strong>{{ c.pacienteNome }} · {{ c.especialidade }}</strong>
                    <span>{{ c.ueNome }} · {{ c.data }} {{ c.hora }}</span>
                  </div>
                  <app-status-badge [status]="c.status" />
                </div>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styleUrl: './home.scss',
})
export class Home {
  indicadores = INDICADORES_GERAIS_MOCK;

  geres = signal<Geres[]>([]);
  alertas = signal<Alerta[]>([]);
  consultas = signal<Consulta[]>([]);
  carregandoAlertas = signal(true);
  carregandoConsultas = signal(true);

  geresOrdenadas = computed(() => [...this.geres()].sort((a, b) => a.ranking - b.ranking).slice(0, 6));
  ultimosAlertas = computed(() => this.alertas().slice(0, 5));
  ultimasConsultas = computed(() => this.consultas().slice(0, 5));

  chartConsultas: ChartConfiguration = {
    type: 'line',
    data: {
      labels: SERIE_CONSULTAS_MES.labels,
      datasets: [
        {
          label: 'Realizadas',
          data: SERIE_CONSULTAS_MES.realizadas,
          borderColor: '#00A859',
          backgroundColor: 'rgba(0,168,89,0.12)',
          tension: 0.35,
          fill: true,
        },
        {
          label: 'Agendadas',
          data: SERIE_CONSULTAS_MES.agendadas,
          borderColor: '#1451B4',
          backgroundColor: 'rgba(20,81,180,0.08)',
          tension: 0.35,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom' } },
      scales: { y: { beginAtZero: true } },
    },
  };

  constructor(
    public auth: AuthService,
    private geresService: GeresService,
    private alertaService: AlertaService,
    private consultaService: ConsultaService,
  ) {
    this.geresService.listar().subscribe((g) => this.geres.set(g));
    this.alertaService.listar().subscribe((a) => {
      this.alertas.set(a);
      this.carregandoAlertas.set(false);
    });
    this.consultaService.listar().subscribe((c) => {
      this.consultas.set(c);
      this.carregandoConsultas.set(false);
    });
  }

  primeiroNome(): string {
    return this.auth.usuario()?.nome.split(' ')[0] ?? '';
  }

  fmt(valor: number): string {
    return valor.toLocaleString('pt-BR');
  }
}
