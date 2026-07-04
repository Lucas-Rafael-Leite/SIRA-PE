import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Breadcrumb } from '../../shared/components/breadcrumb/breadcrumb';
import { KpiCard } from '../../shared/components/kpi-card/kpi-card';
import { DataTable, ColunaTabela } from '../../shared/components/data-table/data-table';
import { VagaService } from '../../services/vaga.service';
import { GERES_MOCK } from '../../mock';
import { Vaga } from '../../models';
import { VagaDetalheDialog } from '../painel-vagas/dialogs/vaga-detalhe-dialog';

interface LinhaVaga extends Record<string, unknown> {
  ueNome: string;
  municipioNome: string;
  geresNome: string;
  especialidade: string;
  data: string;
  status: string;
  __id: string;
}

@Component({
  selector: 'app-vagas-estrategicas',
  standalone: true,
  imports: [FormsModule, MatDialogModule, Breadcrumb, KpiCard, DataTable],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="sira-page sira-fade-in">
      <app-breadcrumb [itens]="[{ label: 'Dashboard', route: '/home' }, { label: 'Vagas Estratégicas' }]" />

      <div class="sira-page-header">
        <div class="sira-page-header__title">
          <span class="sira-eyebrow">Prevenção de perda primária</span>
          <h1>Vagas Estratégicas</h1>
          <p>Vagas marcadas como estratégicas em todo o estado, para acompanhamento prioritário.</p>
        </div>
      </div>

      <div class="sira-grid sira-grid--kpi" style="margin-bottom:20px">
        <app-kpi-card label="Total de vagas estratégicas" [value]="fmt(vagasFiltradas().length)" icon="star" tone="alert" />
        <app-kpi-card label="Disponíveis" [value]="fmt(contarStatus('disponivel'))" icon="event_seat" tone="sus" />
        <app-kpi-card label="Agendadas" [value]="fmt(contarStatus('agendada'))" icon="event_available" tone="pending" />
      </div>

      <div class="sira-card sira-toolbar">
        <select class="filtro-select" [(ngModel)]="geresSelecionada" (ngModelChange)="atualizarFiltro()">
          <option value="">Todas as GERES</option>
          @for (g of geresLista; track g.id) { <option [value]="g.nome">{{ g.nome }}</option> }
        </select>
        <select class="filtro-select" [(ngModel)]="statusSelecionado" (ngModelChange)="atualizarFiltro()">
          <option value="">Todos os status</option>
          <option value="disponivel">Disponível</option>
          <option value="agendada">Agendada</option>
        </select>
      </div>

      <app-data-table [dados]="linhas()" [colunas]="colunas" [carregando]="carregando()" (linhaClicada)="abrirDetalhe($event)" [tamanhoPagina]="10" />
    </div>
  `,
})
export class VagasEstrategicas {
  geresLista = GERES_MOCK;
  vagas = signal<Vaga[]>([]);
  carregando = signal(true);
  geresSelecionada = '';
  statusSelecionado = '';
  private geresSignal = signal('');
  private statusSignal = signal('');

  colunas: ColunaTabela<LinhaVaga>[] = [
    { chave: 'ueNome', titulo: 'Unidade', tipo: 'destaque', larguraMin: '200px' },
    { chave: 'municipioNome', titulo: 'Município' },
    { chave: 'geresNome', titulo: 'GERES', larguraMin: '180px' },
    { chave: 'especialidade', titulo: 'Especialidade' },
    { chave: 'data', titulo: 'Data/Hora' },
    { chave: 'status', titulo: 'Status', tipo: 'badge' },
  ];

  estrategicas = computed(() => this.vagas().filter((v) => v.estrategica));

  vagasFiltradas = computed(() => {
    const geres = this.geresSignal();
    const status = this.statusSignal();
    return this.estrategicas().filter((v) => (!geres || v.geresNome === geres) && (!status || v.status === status));
  });

  linhas = computed<LinhaVaga[]>(() =>
    this.vagasFiltradas().map((v) => ({
      __id: v.id,
      ueNome: v.ueNome,
      municipioNome: v.municipioNome,
      geresNome: v.geresNome,
      especialidade: v.especialidade,
      data: `${v.data} ${v.hora}`,
      status: v.status,
    })),
  );

  constructor(
    private vagaService: VagaService,
    private dialog: MatDialog,
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
    this.geresSignal.set(this.geresSelecionada);
    this.statusSignal.set(this.statusSelecionado);
  }

  contarStatus(status: string): number {
    return this.vagasFiltradas().filter((v) => v.status === status).length;
  }

  abrirDetalhe(linha: LinhaVaga): void {
    const vaga = this.vagas().find((v) => v.id === linha['__id']);
    if (!vaga) return;
    const ref = this.dialog.open(VagaDetalheDialog, { width: '520px', data: { vaga } });
    ref.afterClosed().subscribe(() => this.carregar());
  }

  fmt(v: number): string {
    return v.toLocaleString('pt-BR');
  }
}
