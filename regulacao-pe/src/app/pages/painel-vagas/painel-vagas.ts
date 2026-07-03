import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Breadcrumb } from '../../shared/components/breadcrumb/breadcrumb';
import { KpiCard } from '../../shared/components/kpi-card/kpi-card';
import { DataTable, ColunaTabela } from '../../shared/components/data-table/data-table';
import { VagaService } from '../../services/vaga.service';
import { NotificationService } from '../../services/notification.service';
import { ESPECIALIDADES_MOCK, GERES_MOCK, MUNICIPIOS_MOCK } from '../../mock';
import { Vaga } from '../../models';

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
  imports: [FormsModule, Breadcrumb, KpiCard, DataTable],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="sira-page sira-fade-in">
      <app-breadcrumb [itens]="[{ label: 'Dashboard', route: '/home' }, { label: 'Painel de Vagas' }]" />

      <div class="sira-page-header">
        <div class="sira-page-header__title">
          <span class="sira-eyebrow">Governança da oferta</span>
          <h1>Painel de Vagas</h1>
          <p>Visão consolidada da oferta de vagas ambulatoriais no estado.</p>
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
        <app-kpi-card label="Estratégicas" [value]="fmt(kpis().estrategicas)" icon="star" tone="alert" />
      </div>

      <div class="sira-card sira-toolbar filtros-avancados">
        <select class="filtro-select" [(ngModel)]="especialidadeSelecionada" (ngModelChange)="atualizarFiltro()">
          <option value="">Especialidade</option>
          @for (e of especialidades; track e) { <option [value]="e">{{ e }}</option> }
        </select>
        <select class="filtro-select" [(ngModel)]="municipioSelecionado" (ngModelChange)="atualizarFiltro()">
          <option value="">Município</option>
          @for (m of municipios; track m.id) { <option [value]="m.nome">{{ m.nome }}</option> }
        </select>
        <select class="filtro-select" [(ngModel)]="geresSelecionada" (ngModelChange)="atualizarFiltro()">
          <option value="">GERES</option>
          @for (g of geresLista; track g.id) { <option [value]="g.nome">{{ g.nome }}</option> }
        </select>
        <select class="filtro-select" [(ngModel)]="statusSelecionado" (ngModelChange)="atualizarFiltro()">
          <option value="">Status</option>
          <option value="disponivel">Disponível</option>
          <option value="agendada">Agendada</option>
          <option value="bloqueada">Bloqueada</option>
          <option value="realizada">Realizada</option>
          <option value="cancelada">Cancelada</option>
        </select>
      </div>

      <div class="sira-card panel" style="margin-bottom:20px">
        <div class="panel__header">
          <h3>Mapa de calor · Vagas por especialidade x status</h3>
          <span class="sira-eyebrow">{{ vagasFiltradas().length }} vagas no filtro atual</span>
        </div>
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
      </div>

      <app-data-table
        [dados]="linhas()"
        [colunas]="colunas"
        [carregando]="carregando()"
        [acoesTemplate]="acoesTpl"
        [tamanhoPagina]="10"
      />

      <ng-template #acoesTpl let-linha>
        <button class="link-btn" [disabled]="linha.estrategica === 'Sim'" (click)="marcarEstrategica(linha)">
          Marcar estratégica
        </button>
      </ng-template>
    </div>
  `,
  styleUrl: './painel-vagas.scss',
})
export class PainelVagas {
  especialidades = ESPECIALIDADES_MOCK;
  municipios = MUNICIPIOS_MOCK;
  geresLista = GERES_MOCK;
  statusOrdenados = ['disponivel', 'agendada', 'bloqueada', 'realizada', 'cancelada'];

  vagas = signal<Vaga[]>([]);
  carregando = signal(true);

  especialidadeSelecionada = '';
  municipioSelecionado = '';
  geresSelecionada = '';
  statusSelecionado = '';

  private especialidadeSignal = signal('');
  private municipioSignal = signal('');
  private geresSignal = signal('');
  private statusSignal = signal('');

  colunas: ColunaTabela<LinhaVaga>[] = [
    { chave: 'ueNome', titulo: 'Unidade', larguraMin: '200px' },
    { chave: 'municipioNome', titulo: 'Município' },
    { chave: 'especialidade', titulo: 'Especialidade' },
    { chave: 'profissionalNome', titulo: 'Profissional', larguraMin: '180px' },
    { chave: 'data', titulo: 'Data/Hora' },
    { chave: 'estrategica', titulo: 'Estratégica' },
    { chave: 'status', titulo: 'Status', tipo: 'badge' },
  ];

  vagasFiltradas = computed(() => {
    const esp = this.especialidadeSignal();
    const mun = this.municipioSignal();
    const geres = this.geresSignal();
    const status = this.statusSignal();
    return this.vagas().filter((v) => {
      return (
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

  constructor(
    private vagaService: VagaService,
    private notify: NotificationService,
  ) {
    this.carregar();
  }

  private carregar(): void {
    this.vagaService.listar().subscribe((dados) => {
      this.vagas.set(dados);
      this.carregando.set(false);
    });
  }

  atualizarFiltro(): void {
    this.especialidadeSignal.set(this.especialidadeSelecionada);
    this.municipioSignal.set(this.municipioSelecionado);
    this.geresSignal.set(this.geresSelecionada);
    this.statusSignal.set(this.statusSelecionado);
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
    this.notify.sucesso('Vaga marcada como estratégica.');
    this.carregar();
  }

  exportar(): void {
    this.notify.info('Exportação simulada gerada com sucesso.');
  }

  fmt(v: number): string {
    return v.toLocaleString('pt-BR');
  }
}
