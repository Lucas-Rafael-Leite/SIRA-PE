import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ChartConfiguration } from 'chart.js';
import { Breadcrumb } from '../../shared/components/breadcrumb/breadcrumb';
import { KpiCard } from '../../shared/components/kpi-card/kpi-card';
import { ChartCanvas } from '../../shared/components/chart/chart-canvas';
import { StatusBadge } from '../../shared/components/status-badge/status-badge';
import { LoadingSkeleton } from '../../shared/components/loading-skeleton/loading-skeleton';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { MunicipioService } from '../../services/municipio.service';
import { UeService } from '../../services/ue.service';
import { ConsultaService } from '../../services/consulta.service';
import { AlertaService } from '../../services/alerta.service';
import { Municipio, UnidadeExecutante, Consulta, Alerta } from '../../models';

@Component({
  selector: 'app-municipio-detalhe',
  standalone: true,
  imports: [RouterLink, Breadcrumb, KpiCard, ChartCanvas, StatusBadge, LoadingSkeleton, EmptyState],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="sira-page sira-fade-in">
      @if (carregando()) {
        <app-loading-skeleton variante="card" [quantidade]="4" />
      } @else if (!municipio()) {
        <app-empty-state icon="location_off" titulo="Município não encontrado" descricao="Volte para a lista de municípios." />
      } @else {
        <app-breadcrumb
          [itens]="[{ label: 'Dashboard', route: '/home' }, { label: 'Municípios', route: '/municipios' }, { label: municipio()!.nome }]"
        />

        <div class="sira-page-header">
          <div class="sira-page-header__title">
            <span class="sira-eyebrow">{{ municipio()!.geresNome }}</span>
            <h1>{{ municipio()!.nome }}</h1>
            <p>{{ fmt(municipio()!.habitantes) }} habitantes · {{ fmt(municipio()!.consultasMes) }} consultas/mês</p>
          </div>
        </div>

        <div class="sira-grid sira-grid--kpi" style="margin-bottom:20px">
          <app-kpi-card label="Absenteísmo" [value]="municipio()!.indicadorAbsenteismo + '%'" icon="person_off" tone="pending" />
          <app-kpi-card label="Ocupação de agenda" [value]="municipio()!.indicadorOcupacao + '%'" icon="event_seat" tone="sus" />
          <app-kpi-card label="Alertas ativos" [value]="municipio()!.alertasAtivos + ''" icon="campaign" tone="alert" />
          <app-kpi-card label="Unidades Executantes" [value]="unidades().length + ''" icon="local_hospital" tone="primary" />
        </div>

        <div class="sira-grid sira-grid--2" style="margin-bottom:20px">
          <div class="sira-card panel">
            <h3>Indicadores do município</h3>
            <app-chart-canvas [config]="chartIndicadores" [altura]="240" />
          </div>

          <div class="sira-card panel">
            <div class="panel__header">
              <h3>Unidades Executantes</h3>
              <a routerLink="/unidades">Ver todas</a>
            </div>
            <div class="lista-simples">
              @for (u of unidades(); track u.id) {
                <a class="lista-simples__item" [routerLink]="['/unidades', u.id]">
                  <div>
                    <strong>{{ u.nome }}</strong>
                    <span>{{ u.tipo }} · {{ u.profissionaisQtd }} profissionais</span>
                  </div>
                  <app-status-badge [status]="u.status" />
                </a>
              }
            </div>
          </div>
        </div>

        <div class="sira-grid sira-grid--2">
          <div class="sira-card panel">
            <div class="panel__header"><h3>Consultas recentes</h3></div>
            <div class="lista-simples">
              @for (c of consultas(); track c.id) {
                <div class="lista-simples__item">
                  <div>
                    <strong>{{ c.pacienteNome }} · {{ c.especialidade }}</strong>
                    <span>{{ c.ueNome }} · {{ c.data }}</span>
                  </div>
                  <app-status-badge [status]="c.status" />
                </div>
              }
            </div>
          </div>

          <div class="sira-card panel">
            <div class="panel__header"><h3>Alertas do município</h3></div>
            @if (alertas().length === 0) {
              <app-empty-state icon="notifications_off" titulo="Sem alertas ativos" descricao="Este município não possui alertas pendentes." />
            } @else {
              <div class="lista-simples">
                @for (a of alertas(); track a.id) {
                  <div class="lista-simples__item">
                    <div>
                      <strong>{{ a.titulo }}</strong>
                      <span>{{ a.dataEnvio }}</span>
                    </div>
                    <app-status-badge [status]="a.prioridade" />
                  </div>
                }
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styleUrl: './municipio-detalhe.scss',
})
export class MunicipioDetalhe {
  municipio = signal<Municipio | undefined>(undefined);
  unidades = signal<UnidadeExecutante[]>([]);
  consultas = signal<Consulta[]>([]);
  alertas = signal<Alerta[]>([]);
  carregando = signal(true);

  chartIndicadores: ChartConfiguration = { type: 'bar', data: { labels: [], datasets: [] } };

  constructor(
    route: ActivatedRoute,
    municipioService: MunicipioService,
    ueService: UeService,
    consultaService: ConsultaService,
    alertaService: AlertaService,
  ) {
    const id = route.snapshot.paramMap.get('id') ?? '';

    municipioService.obterPorId(id).subscribe((m) => {
      this.municipio.set(m);
      this.carregando.set(false);

      if (m) {
        this.chartIndicadores = {
          type: 'bar',
          data: {
            labels: ['Absenteísmo', 'Ocupação'],
            datasets: [
              {
                label: '%',
                data: [m.indicadorAbsenteismo, m.indicadorOcupacao],
                backgroundColor: ['#F2B705', '#00A859'],
                borderRadius: 6,
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
      }
    });

    ueService.listarPorMunicipio(id).subscribe((u) => this.unidades.set(u));
    consultaService.listar().subscribe((lista) =>
      this.consultas.set(lista.filter((c) => c.municipioNome === this.municipio()?.nome).slice(0, 6)),
    );
    alertaService.listar().subscribe((lista) =>
      this.alertas.set(lista.filter((a) => a.destinoNome === this.municipio()?.nome)),
    );
  }

  fmt(v: number): string {
    return v.toLocaleString('pt-BR');
  }
}
