import { ChangeDetectionStrategy, Component, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Breadcrumb } from '../../shared/components/breadcrumb/breadcrumb';
import { KpiCard } from '../../shared/components/kpi-card/kpi-card';
import { DataTable, ColunaTabela } from '../../shared/components/data-table/data-table';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { VagaService } from '../../services/vaga.service';
import { AlertaVagaService } from '../../services/alerta-vaga.service';
import { NotificationService } from '../../services/notification.service';
import { EscopoService } from '../../core/services/escopo.service';
import { AuthService } from '../../core/services/auth.service';
import { ESPECIALIDADES_MOCK, GERES_MOCK, MUNICIPIOS_MOCK } from '../../mock';
import { Vaga, AlertaDisponibilidadeVaga } from '../../models';

interface LinhaVaga extends Record<string, unknown> {
  ueNome: string;
  municipioNome: string;
  especialidade: string;
  profissionalNome: string;
  data: string;
  status: string;
  estrategica: string;
  __id: string;
}

@Component({
  selector: 'app-painel-vagas',
  standalone: true,
  imports: [FormsModule, Breadcrumb, KpiCard, DataTable, EmptyState],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="sira-page sira-fade-in">
      <app-breadcrumb [itens]="[{ label: 'Dashboard', route: '/home' }, { label: 'Painel de Vagas' }]" />

      <div class="sira-page-header">
        <div class="sira-page-header__title">
          <span class="sira-eyebrow">Governança da oferta</span>
          <h1>Painel de Vagas</h1>
          <p>{{ subtitulo() }}</p>
        </div>
        <button class="btn-secondary" (click)="exportar()">
          <span class="material-icons-round">download</span>
          Exportar
        </button>
      </div>

      <div class="sira-grid sira-grid--kpi" style="margin-bottom:20px">
        <app-kpi-card label="Vagas totais" [value]="fmt(kpis().total)" icon="grid_view" tone="primary" />
        <app-kpi-card label="Disponíveis" [value]="fmt(kpis().disponiveis)" icon="event_seat" tone="sus" />
        <app-kpi-card label="Agendadas" [value]="fmt(kpis().agendadas)" icon="event_available" tone="pending" />
        @if (!ehUe()) {
          <app-kpi-card label="Estratégicas" [value]="fmt(kpis().estrategicas)" icon="star" tone="alert" />
        } @else {
          <app-kpi-card label="Alertas de vaga ativos" [value]="fmt(alertasVaga().length)" icon="notifications_active" tone="alert" />
        }
      </div>

      <div class="sira-card sira-toolbar filtros-avancados">
        <div class="filtro-busca">
          <span class="material-icons-round">search</span>
          <input
            type="text"
            placeholder="Buscar por unidade, especialidade ou profissional..."
            [(ngModel)]="termo"
            (ngModelChange)="atualizarFiltro()"
          />
        </div>
        <select class="filtro-select" [(ngModel)]="especialidadeSelecionada" (ngModelChange)="atualizarFiltro()">
          <option value="">Especialidade</option>
          @for (e of especialidades; track e) { <option [value]="e">{{ e }}</option> }
        </select>
        @if (!ehUe() && !ehMunicipio()) {
          <select class="filtro-select" [(ngModel)]="municipioSelecionado" (ngModelChange)="atualizarFiltro()">
            <option value="">Município</option>
            @for (m of municipiosDisponiveis(); track m.id) { <option [value]="m.nome">{{ m.nome }}</option> }
          </select>
        }
        @if (podeVerTodasGeres()) {
          <select class="filtro-select" [(ngModel)]="geresSelecionada" (ngModelChange)="atualizarFiltro()">
            <option value="">GERES</option>
            @for (g of geresLista; track g.id) { <option [value]="g.nome">{{ g.nome }}</option> }
          </select>
        }
        <select class="filtro-select" [(ngModel)]="statusSelecionado" (ngModelChange)="atualizarFiltro()">
          <option value="">Status</option>
          <option value="disponivel">Disponível</option>
          <option value="agendada">Agendada</option>
          <option value="bloqueada">Bloqueada</option>
          <option value="realizada">Realizada</option>
          <option value="cancelada">Cancelada</option>
        </select>
      </div>

      @if (ehUe()) {
        <div class="sira-card panel" style="margin-bottom:20px">
          <div class="panel__header">
            <h3>Alertas de disponibilidade de vaga</h3>
            <span class="sira-eyebrow">Seja notificado quando uma vaga da especialidade abrir</span>
          </div>
          <div class="criar-alerta-vaga">
            <select class="filtro-select" [(ngModel)]="especialidadeAlerta">
              <option value="">Selecione a especialidade</option>
              @for (e of especialidades; track e) { <option [value]="e">{{ e }}</option> }
            </select>
            <button class="btn-primary" [disabled]="!especialidadeAlerta" (click)="criarAlertaVaga()">
              <span class="material-icons-round">notification_add</span>
              Criar alerta
            </button>
          </div>
          @if (alertasVaga().length > 0) {
            <div class="chips" style="margin-top:12px">
              @for (a of alertasVaga(); track a.id) {
                <span class="chip">
                  {{ a.especialidade }}
                  <button class="chip__remover" (click)="removerAlertaVaga(a.id)">
                    <span class="material-icons-round">close</span>
                  </button>
                </span>
              }
            </div>
          }
        </div>
      }

      @if (!ehUe()) {
        <div class="sira-card panel" style="margin-bottom:20px">
          <div class="panel__header">
            <h3>Mapa de calor · Vagas por especialidade x status</h3>
            <span class="sira-eyebrow">{{ vagasFiltradas().length }} vagas no filtro atual</span>
          </div>
          @if (especialidadesHeatmap().length === 0) {
            <app-empty-state icon="grid_off" titulo="Sem dados para o filtro atual" />
          } @else {
            <div class="heatmap">
              <div class="heatmap__row heatmap__row--header">
                <span></span>
                @for (s of statusOrdenados; track s) { <span>{{ rotuloStatus(s) }}</span> }
              </div>
              @for (esp of especialidadesHeatmap(); track esp) {
                <div class="heatmap__row">
                  <span class="heatmap__label">{{ esp }}</span>
                  @for (s of statusOrdenados; track s) {
                    <span
                      class="heatmap__cell"
                      [style.background]="corCelula(esp, s)"
                      [title]="contagem(esp, s) + ' vaga(s)'"
                    >{{ contagem(esp, s) }}</span>
                  }
                </div>
              }
            </div>
          }
        </div>
      }

      <app-data-table
        [dados]="linhas()"
        [colunas]="colunas"
        [carregando]="carregando()"
        [acoesTemplate]="podeMarcarEstrategica() ? acoesTpl : null"
        [tamanhoPagina]="10"
      />

      <ng-template #acoesTpl let-linha>
        <button class="link-btn" [disabled]="linha.estrategica === 'Sim'" (click)="marcarEstrategica(linha)" title="Marcar como estratégica evita perda primária da vaga">
          Marcar estratégica
        </button>
      </ng-template>
    </div>
  `,
  styleUrl: './painel-vagas.scss',
})
export class PainelVagas implements OnInit {
  especialidades = ESPECIALIDADES_MOCK;
  geresLista = GERES_MOCK;
  statusOrdenados = ['disponivel', 'agendada', 'bloqueada', 'realizada', 'cancelada'];

  vagas = signal<Vaga[]>([]);
  alertasVaga = signal<AlertaDisponibilidadeVaga[]>([]);
  carregando = signal(true);

  termo = '';
  especialidadeSelecionada = '';
  municipioSelecionado = '';
  geresSelecionada = '';
  statusSelecionado = '';
  especialidadeAlerta = '';

  private termoSignal = signal('');
  private especialidadeSignal = signal('');
  private municipioSignal = signal('');
  private geresSignal = signal('');
  private statusSignal = signal('');

  ehUe = computed(() => this.escopo.perfil() === 'UnidadeExecutante');
  ehMunicipio = computed(() => this.escopo.perfil() === 'Municipio');
  podeVerTodasGeres = computed(() => this.escopo.visualizaTudo());

  municipiosDisponiveis = computed(() => this.escopo.filtrarMunicipios(MUNICIPIOS_MOCK));

  colunas: ColunaTabela<LinhaVaga>[] = [
    { chave: 'ueNome', titulo: 'Unidade', larguraMin: '200px' },
    { chave: 'municipioNome', titulo: 'Município' },
    { chave: 'especialidade', titulo: 'Especialidade' },
    { chave: 'profissionalNome', titulo: 'Profissional', larguraMin: '180px' },
    { chave: 'data', titulo: 'Data/Hora' },
    { chave: 'estrategica', titulo: 'Estratégica' },
    { chave: 'status', titulo: 'Status', tipo: 'badge' },
  ];

  vagasNoEscopo = computed(() => this.escopo.filtrarPorHierarquia(this.vagas()));

  vagasFiltradas = computed(() => {
    const termo = this.termoSignal().toLowerCase();
    const esp = this.especialidadeSignal();
    const mun = this.municipioSignal();
    const geres = this.geresSignal();
    const status = this.statusSignal();
    return this.vagasNoEscopo().filter((v) => {
      const bateTermo =
        !termo ||
        v.ueNome.toLowerCase().includes(termo) ||
        v.especialidade.toLowerCase().includes(termo) ||
        v.profissionalNome.toLowerCase().includes(termo);
      return (
        bateTermo &&
        (!esp || v.especialidade === esp) &&
        (!mun || v.municipioNome === mun) &&
        (!geres || v.geresNome === geres) &&
        (!status || v.status === status)
      );
    });
  });

  kpis = computed(() => {
    const lista = this.vagasFiltradas();
    return {
      total: lista.length,
      disponiveis: lista.filter((v) => v.status === 'disponivel').length,
      agendadas: lista.filter((v) => v.status === 'agendada').length,
      estrategicas: lista.filter((v) => v.estrategica).length,
    };
  });

  linhas = computed<LinhaVaga[]>(() =>
    this.vagasFiltradas()
      .slice(0, 300)
      .map((v) => ({
        __id: v.id,
        ueNome: v.ueNome,
        municipioNome: v.municipioNome,
        especialidade: v.especialidade,
        profissionalNome: v.profissionalNome,
        data: `${v.data} ${v.hora}`,
        estrategica: v.estrategica ? 'Sim' : 'Não',
        status: v.status,
      })),
  );

  especialidadesHeatmap = computed(() => {
    const contagemPorEsp = new Map<string, number>();
    for (const v of this.vagasFiltradas()) {
      contagemPorEsp.set(v.especialidade, (contagemPorEsp.get(v.especialidade) ?? 0) + 1);
    }
    return [...contagemPorEsp.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([esp]) => esp);
  });

  subtitulo = computed(() => {
    if (this.ehUe()) return 'Vagas e agendas da sua unidade executante.';
    if (this.ehMunicipio()) return 'Vagas das unidades executantes do seu município.';
    if (this.escopo.perfil() === 'GERES') return 'Vagas das unidades executantes da sua GERES.';
    return 'Visão consolidada da oferta de vagas ambulatoriais no estado.';
  });

  constructor(
    private vagaService: VagaService,
    private alertaVagaService: AlertaVagaService,
    private notify: NotificationService,
    private escopo: EscopoService,
    private auth: AuthService,
    private route: ActivatedRoute,
  ) {
    this.carregar();
  }

  ngOnInit(): void {
    const busca = this.route.snapshot.queryParamMap.get('busca');
    if (busca) {
      this.termo = busca;
      this.termoSignal.set(busca);
    }
    if (this.ehUe()) {
      this.carregarAlertasVaga();
    }
  }

  private carregar(): void {
    this.vagaService.listar().subscribe((dados) => {
      this.vagas.set(dados);
      this.carregando.set(false);
    });
  }

  private carregarAlertasVaga(): void {
    const ueId = this.escopo.vinculoId();
    if (!ueId) return;
    this.alertaVagaService.listarPorUe(ueId).subscribe((dados) => this.alertasVaga.set(dados));
  }

  atualizarFiltro(): void {
    this.termoSignal.set(this.termo);
    this.especialidadeSignal.set(this.especialidadeSelecionada);
    this.municipioSignal.set(this.municipioSelecionado);
    this.geresSignal.set(this.geresSelecionada);
    this.statusSignal.set(this.statusSelecionado);
  }

  podeMarcarEstrategica(): boolean {
    // A marcação de vaga estratégica evita perda primária e é exclusiva de quem regula (não da UE).
    return this.escopo.perfil() !== 'UnidadeExecutante';
  }

  contagem(especialidade: string, status: string): number {
    return this.vagasFiltradas().filter((v) => v.especialidade === especialidade && v.status === status).length;
  }

  corCelula(especialidade: string, status: string): string {
    const valor = this.contagem(especialidade, status);
    const max = Math.max(1, ...this.statusOrdenados.map((s) => this.contagem(especialidade, s)));
    const intensidade = valor / max;
    const cores: Record<string, string> = {
      disponivel: `rgba(0, 168, 89, ${0.12 + intensidade * 0.6})`,
      agendada: `rgba(20, 81, 180, ${0.12 + intensidade * 0.6})`,
      bloqueada: `rgba(211, 47, 47, ${0.12 + intensidade * 0.6})`,
      realizada: `rgba(31, 99, 214, ${0.1 + intensidade * 0.5})`,
      cancelada: `rgba(242, 183, 5, ${0.12 + intensidade * 0.6})`,
    };
    return cores[status] ?? 'transparent';
  }

  rotuloStatus(status: string): string {
    const mapa: Record<string, string> = {
      disponivel: 'Disponível',
      agendada: 'Agendada',
      bloqueada: 'Bloqueada',
      realizada: 'Realizada',
      cancelada: 'Cancelada',
    };
    return mapa[status] ?? status;
  }

  marcarEstrategica(linha: LinhaVaga): void {
    this.vagaService.marcarEstrategica(linha['__id']);
    this.notify.sucesso('Vaga marcada como estratégica (evita perda primária).');
    this.carregar();
  }

  criarAlertaVaga(): void {
    const ue = this.escopo.minhaUe();
    if (!ue || !this.especialidadeAlerta) return;
    this.alertaVagaService.criar(ue.id, ue.nome, this.especialidadeAlerta);
    this.notify.sucesso(`Você será notificado quando uma vaga de ${this.especialidadeAlerta} abrir.`);
    this.especialidadeAlerta = '';
    this.carregarAlertasVaga();
  }

  removerAlertaVaga(id: string): void {
    this.alertaVagaService.remover(id);
    this.carregarAlertasVaga();
  }

  exportar(): void {
    this.notify.info('Exportação simulada gerada com sucesso.');
  }

  fmt(v: number): string {
    return v.toLocaleString('pt-BR');
  }
}
