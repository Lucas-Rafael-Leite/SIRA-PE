import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ChartConfiguration } from 'chart.js';
import { KpiCard } from '../../shared/components/kpi-card/kpi-card';
import { ChartCanvas } from '../../shared/components/chart/chart-canvas';
import { StatusBadge } from '../../shared/components/status-badge/status-badge';
import { LoadingSkeleton } from '../../shared/components/loading-skeleton/loading-skeleton';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { AuthService } from '../../core/services/auth.service';
import { EscopoService } from '../../core/services/escopo.service';
import { GeresService } from '../../services/geres.service';
import { AlertaService } from '../../services/alerta.service';
import { ConsultaService } from '../../services/consulta.service';
import { UeService } from '../../services/ue.service';
import { VagaService } from '../../services/vaga.service';
import { DashboardConfigService } from '../admin/gerenciar-dashboards/dashboard-config.service';
import { AgendaService } from '../../services/agenda.service';
import { INDICADORES_GERAIS_MOCK, SERIE_CONSULTAS_MES, MUNICIPIOS_MOCK } from '../../mock';
import { Geres, Alerta, Consulta, UnidadeExecutante, Vaga, Agenda } from '../../models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, KpiCard, ChartCanvas, StatusBadge, LoadingSkeleton, EmptyState],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="sira-page sira-fade-in">
      <div class="sira-page-header">
        <div class="sira-page-header__title">
          <span class="sira-eyebrow">{{ eyebrow() }}</span>
          <h1>Olá, {{ primeiroNome() }} 👋</h1>
          <p>{{ subtitulo() }}</p>
        </div>
      </div>

      <!-- ===================== VISÃO: Unidade Executante ===================== -->
      @if (perfil() === 'UnidadeExecutante') {
        <div class="sira-grid sira-grid--kpi" style="margin-bottom: 20px">
          <app-kpi-card label="Vagas disponíveis" [value]="fmt(minhaUe()?.vagasDisponiveis ?? 0)" icon="event_seat" tone="sus" />
          <app-kpi-card label="Vagas totais" [value]="fmt(minhaUe()?.vagasTotais ?? 0)" icon="grid_view" tone="primary" />
          <app-kpi-card label="Especialidades atendidas" [value]="fmt(minhaUe()?.especialidades?.length ?? 0)" icon="medical_services" tone="pending" />
          <app-kpi-card label="Profissionais ativos" [value]="fmt(minhaUe()?.profissionaisQtd ?? 0)" icon="groups" tone="neutral" />
        </div>

        <div class="sira-grid sira-grid--2">
          <div class="sira-card panel">
            <div class="panel__header">
              <h3>Notificações para sua unidade</h3>
              <a routerLink="/alertas">Ver todas</a>
            </div>
            @if (carregandoAlertas()) {
              <app-loading-skeleton variante="linha" [quantidade]="4" />
            } @else if (ultimosAlertas().length === 0) {
              <app-empty-state icon="notifications_off" titulo="Nenhuma notificação recente" />
            } @else {
              <div class="alert-list">
                @for (a of ultimosAlertas(); track a.id) {
                  <div class="alert-list__item">
                    <span class="material-icons-round alert-list__icon" [class]="'alert-list__icon--' + a.prioridade">campaign</span>
                    <div class="alert-list__body">
                      <strong>{{ a.titulo }}</strong>
                      <span>Enviado por {{ a.autor }} · {{ a.dataEnvio }}</span>
                    </div>
                    <app-status-badge [status]="a.prioridade" />
                  </div>
                }
              </div>
            }
          </div>

          <div class="sira-card panel">
            <div class="panel__header">
              <h3>Suas vagas mais recentes</h3>
              <a routerLink="/painel-vagas">Ver painel completo</a>
            </div>
            @if (minhasVagas().length === 0) {
              <app-empty-state icon="event_busy" titulo="Nenhuma vaga cadastrada" />
            } @else {
              <div class="alert-list">
                @for (v of minhasVagas(); track v.id) {
                  <div class="alert-list__item">
                    <span class="material-icons-round alert-list__icon alert-list__icon--info">event</span>
                    <div class="alert-list__body">
                      <strong>{{ v.especialidade }} · {{ v.profissionalNome }}</strong>
                      <span>{{ v.data }} {{ v.hora }}</span>
                    </div>
                    <app-status-badge [status]="v.status" />
                  </div>
                }
              </div>
            }
          </div>
        </div>
      }

      <!-- ===================== VISÃO: Município ===================== -->
      @if (perfil() === 'Municipio') {
        <div class="sira-grid sira-grid--kpi" style="margin-bottom: 20px">
          <app-kpi-card label="Consultas no mês" [value]="fmt(meuMunicipio()?.consultasMes ?? 0)" icon="event_available" tone="primary" />
          <app-kpi-card label="Absenteísmo" [value]="(meuMunicipio()?.indicadorAbsenteismo ?? 0) + '%'" icon="person_off" tone="pending" />
          <app-kpi-card label="Ocupação de agenda" [value]="(meuMunicipio()?.indicadorOcupacao ?? 0) + '%'" icon="event_seat" tone="sus" />
          <app-kpi-card label="Unidades Executantes" [value]="fmt(minhasUes().length)" icon="local_hospital" tone="neutral" />
        </div>

        <div class="sira-grid sira-grid--2">
          <div class="sira-card panel">
            <div class="panel__header">
              <h3>Unidades Executantes do município</h3>
              <a routerLink="/unidades">Ver todas</a>
            </div>
            <div class="alert-list">
              @for (u of minhasUes().slice(0, 6); track u.id) {
                <div class="alert-list__item">
                  <span class="material-icons-round alert-list__icon alert-list__icon--info">local_hospital</span>
                  <div class="alert-list__body">
                    <strong>{{ u.nome }}</strong>
                    <span>{{ u.tipo }} · {{ u.vagasDisponiveis }} vagas disponíveis</span>
                  </div>
                  <app-status-badge [status]="u.status" />
                </div>
              }
            </div>
          </div>

          <div class="sira-card panel">
            <div class="panel__header">
              <h3>Notificações recebidas</h3>
              <a routerLink="/alertas">Ver todas</a>
            </div>
            @if (ultimosAlertas().length === 0) {
              <app-empty-state icon="notifications_off" titulo="Nenhuma notificação recente" />
            } @else {
              <div class="alert-list">
                @for (a of ultimosAlertas(); track a.id) {
                  <div class="alert-list__item">
                    <span class="material-icons-round alert-list__icon" [class]="'alert-list__icon--' + a.prioridade">campaign</span>
                    <div class="alert-list__body">
                      <strong>{{ a.titulo }}</strong>
                      <span>{{ a.autor }} · {{ a.dataEnvio }}</span>
                    </div>
                    <app-status-badge [status]="a.prioridade" />
                  </div>
                }
              </div>
            }
          </div>
        </div>
      }

      <!-- ===================== VISÃO: Administrador / GRAMB / GERES ===================== -->
      @if (perfil() === 'Administrador' || perfil() === 'GRAMB' || perfil() === 'GERES') {
        <div class="sira-grid sira-grid--kpi" style="margin-bottom: 20px">
          <app-kpi-card label="Consultas no mês" [value]="fmt(indicadores.totalConsultasMes)" icon="event_available" tone="primary" trend="alta" trendLabel="+4,8% vs. mês anterior" />
          <app-kpi-card label="Vagas disponíveis" [value]="fmt(indicadores.totalVagasDisponiveis)" icon="event_seat" tone="sus" trend="estavel" trendLabel="Estável na semana" />
          <app-kpi-card label="Absenteísmo médio" [value]="indicadores.absenteismoMedio + '%'" icon="person_off" tone="pending" trend="baixa" trendLabel="-1,2 p.p. no mês" />
          <app-kpi-card label="Tempo médio de espera" [value]="indicadores.tempoMedioEsperaDias + ' dias'" icon="hourglass_top" tone="alert" trend="alta" trendLabel="+2 dias vs. meta" />
        </div>

        <div class="sira-grid sira-grid--kpi" style="margin-bottom: 20px">
          <app-kpi-card label="Agendas enviadas" [value]="fmt(agendasNoEscopo().length)" icon="upload_file" tone="primary" />
          <app-kpi-card label="Agendas reenviadas" [value]="fmt(agendasReenviadasQtd())" icon="replay" tone="pending" trendLabel="Precisaram de correção após devolução" trend="baixa" />
          <app-kpi-card label="Agendas devolvidas (aguardando)" [value]="fmt(agendasDevolvidasQtd())" icon="assignment_return" tone="alert" />
        </div>

        @if (widgetVisivel('grafico-consultas') || widgetVisivel('ranking-geres')) {
          <div class="sira-grid sira-grid--2" style="margin-bottom: 20px">
            @if (widgetVisivel('grafico-consultas')) {
              <div class="sira-card panel">
                <div class="panel__header">
                  <h3>Consultas: agendadas x realizadas</h3>
                  <span class="sira-eyebrow">Últimos 7 meses</span>
                </div>
                <app-chart-canvas [config]="chartConsultas" [altura]="260" />
              </div>
            }

            @if (widgetVisivel('ranking-geres')) {
              <div class="sira-card panel">
                <div class="panel__header">
                  <h3>{{ perfil() === 'GERES' ? 'Meus municípios' : 'Ranking das GERES' }}</h3>
                  @if (perfil() !== 'GERES') {
                    <a routerLink="/dashboard-analitico">Ver dashboard completo</a>
                  }
                </div>
                @if (perfil() !== 'GERES') {
                  <p class="explicacao-indicador">
                    <span class="material-icons-round">info</span>
                    O <strong>indicador geral</strong> é um índice de 0 a 100 que resume, para cada GERES,
                    a combinação entre ocupação de agenda, absenteísmo e tempo médio de espera — quanto
                    maior, melhor o desempenho da regulação naquela região.
                  </p>
                }
                @if (perfil() === 'GERES') {
                  <div class="ranking-list">
                    @for (m of municipiosDaGeres(); track m.id) {
                      <div class="ranking-item">
                        <div class="ranking-item__info" style="width:200px">
                          <strong>{{ m.nome }}</strong>
                          <span>{{ fmt(m.consultasMes) }} consultas/mês</span>
                        </div>
                        <div class="ranking-item__bar">
                          <div class="ranking-item__bar-fill" [style.width.%]="m.indicadorOcupacao"></div>
                        </div>
                        <span class="ranking-item__valor">{{ m.indicadorOcupacao }}%</span>
                      </div>
                    }
                  </div>
                } @else {
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
                }
              </div>
            }
          </div>
        }

        @if (widgetVisivel('ultimos-alertas') || widgetVisivel('ultimas-consultas')) {
          <div class="sira-grid sira-grid--2">
            @if (widgetVisivel('ultimos-alertas')) {
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
            }

            @if (widgetVisivel('ultimas-consultas')) {
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
            }
          </div>
        }
      }
    </div>
  `,
  styleUrl: './home.scss',
})
export class Home {
  indicadores = INDICADORES_GERAIS_MOCK;

  geres = signal<Geres[]>([]);
  alertas = signal<Alerta[]>([]);
  consultas = signal<Consulta[]>([]);
  ues = signal<UnidadeExecutante[]>([]);
  vagas = signal<Vaga[]>([]);
  agendas = signal<Agenda[]>([]);
  carregandoAlertas = signal(true);
  carregandoConsultas = signal(true);

  perfil = computed(() => this.escopo.perfil());
  minhaUe = computed(() => this.escopo.minhaUe());
  meuMunicipio = computed(() => this.escopo.meuMunicipio());
  minhasUes = computed(() => this.escopo.filtrarUes(this.ues()));
  minhasVagas = computed(() => this.escopo.filtrarPorHierarquia(this.vagas()).slice(0, 5));

  municipiosDaGeres = computed(() =>
    MUNICIPIOS_MOCK.filter((m) => m.geresId === this.escopo.vinculoId()).slice(0, 6),
  );

  geresOrdenadas = computed(() => [...this.geres()].sort((a, b) => a.ranking - b.ranking).slice(0, 6));
  ultimosAlertas = computed(() => this.alertaService.recebidosPor(this.auth.usuario()).slice(0, 5));
  ultimasConsultas = computed(() => this.escopo.filtrarPorHierarquia(this.consultas()).slice(0, 5));

  agendasNoEscopo = computed(() => {
    const perfil = this.perfil();
    if (perfil === 'GERES') {
      return this.agendas().filter((a) => a.geresNome === this.escopo.vinculoNome());
    }
    return this.agendas(); // Administrador e GRAMB veem o total estadual
  });

  agendasReenviadasQtd = computed(() => this.agendasNoEscopo().filter((a) => a.vezesReenviada > 0).length);
  agendasDevolvidasQtd = computed(() => this.agendasNoEscopo().filter((a) => a.status === 'devolvida').length);

  eyebrow = computed(() => {
    const mapa: Record<string, string> = {
      Administrador: 'Painel geral',
      GRAMB: 'Painel geral',
      GERES: 'Painel da GERES',
      Municipio: 'Painel do município',
      UnidadeExecutante: 'Painel da unidade',
    };
    return mapa[this.perfil() ?? ''] ?? 'Painel geral';
  });

  subtitulo = computed(() => {
    const mapa: Record<string, string> = {
      Administrador: 'Visão consolidada da regulação ambulatorial em Pernambuco.',
      GRAMB: 'Visão consolidada da regulação ambulatorial em Pernambuco.',
      GERES: 'Indicadores dos municípios e UEs sob responsabilidade da sua GERES.',
      Municipio: 'Indicadores das unidades executantes do seu município.',
      UnidadeExecutante: 'Vagas, agenda e notificações da sua unidade.',
    };
    return mapa[this.perfil() ?? ''] ?? '';
  });

  chartConsultas: ChartConfiguration = {
    type: 'line',
    data: {
      labels: SERIE_CONSULTAS_MES.labels,
      datasets: [
        { label: 'Realizadas', data: SERIE_CONSULTAS_MES.realizadas, borderColor: '#00A859', backgroundColor: 'rgba(0,168,89,0.12)', tension: 0.35, fill: true },
        { label: 'Agendadas', data: SERIE_CONSULTAS_MES.agendadas, borderColor: '#1451B4', backgroundColor: 'rgba(20,81,180,0.08)', tension: 0.35, fill: true },
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
    private escopo: EscopoService,
    private geresService: GeresService,
    private alertaService: AlertaService,
    private consultaService: ConsultaService,
    private ueService: UeService,
    private vagaService: VagaService,
    private agendaService: AgendaService,
    private dashboardConfig: DashboardConfigService,
  ) {
    this.geresService.listar().subscribe((g) => this.geres.set(g));
    this.alertaService.listar().subscribe(() => this.carregandoAlertas.set(false));
    this.consultaService.listar().subscribe((c) => {
      this.consultas.set(c);
      this.carregandoConsultas.set(false);
    });
    this.ueService.listar().subscribe((u) => this.ues.set(u));
    this.vagaService.listar().subscribe((v) => this.vagas.set(v));
    this.agendaService.listar().subscribe((a) => this.agendas.set(a));
  }

  widgetVisivel(id: string): boolean {
    return this.dashboardConfig.estaVisivel(id);
  }

  primeiroNome(): string {
    return this.auth.usuario()?.nome.split(' ')[0] ?? '';
  }

  fmt(valor: number): string {
    return valor.toLocaleString('pt-BR');
  }
}
