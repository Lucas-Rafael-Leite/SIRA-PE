import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Breadcrumb } from '../../shared/components/breadcrumb/breadcrumb';
import { DataTable, ColunaTabela } from '../../shared/components/data-table/data-table';
import { AgendaService } from '../../services/agenda.service';
import { EscopoService } from '../../core/services/escopo.service';
import { UES_MOCK } from '../../mock';
import { Agenda } from '../../models';

interface LinhaAgenda extends Record<string, unknown> {
  ueNome: string;
  municipioNome: string;
  responsavelUeNome: string;
  especialidade: string;
  periodo: string;
  vagas: string;
  status: string;
}

@Component({
  selector: 'app-agendas-recebidas',
  standalone: true,
  imports: [FormsModule, Breadcrumb, DataTable],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="sira-page sira-fade-in">
      <app-breadcrumb [itens]="[{ label: 'Dashboard', route: '/home' }, { label: 'Agendas Recebidas' }]" />

      <div class="sira-page-header">
        <div class="sira-page-header__title">
          <span class="sira-eyebrow">Recebimento de agendas</span>
          <h1>Agendas Recebidas</h1>
          <p>{{ subtitulo() }}</p>
        </div>
      </div>

      <div class="sira-card sira-toolbar">
        <div class="filtro-busca">
          <span class="material-icons-round">search</span>
          <input type="text" placeholder="Buscar unidade..." [(ngModel)]="termo" (ngModelChange)="atualizarFiltro()" />
        </div>
        <select class="filtro-select" [(ngModel)]="statusSelecionado" (ngModelChange)="atualizarFiltro()">
          <option value="">Todos os status</option>
          <option value="pendente">Pendente</option>
          <option value="validada">Validada</option>
          <option value="com_inconsistencias">Com inconsistências</option>
          <option value="publicada">Publicada</option>
        </select>
      </div>

      <app-data-table [dados]="linhas()" [colunas]="colunas()" [carregando]="carregando()" [tamanhoPagina]="10" />
    </div>
  `,
})
export class AgendasRecebidas {
  agendas = signal<Agenda[]>([]);
  carregando = signal(true);
  termo = '';
  statusSelecionado = '';
  private termoSignal = signal('');
  private statusSignal = signal('');

  ehAdmin = computed(() => this.escopo.perfil() === 'Administrador');

  colunas = computed<ColunaTabela<LinhaAgenda>[]>(() => {
    const base: ColunaTabela<LinhaAgenda>[] = [
      { chave: 'ueNome', titulo: 'Unidade', tipo: 'destaque', larguraMin: '200px' },
      { chave: 'municipioNome', titulo: 'Município' },
      { chave: 'especialidade', titulo: 'Especialidade' },
      { chave: 'periodo', titulo: 'Período', larguraMin: '180px' },
      { chave: 'vagas', titulo: 'Vagas' },
      { chave: 'status', titulo: 'Status', tipo: 'badge' },
    ];
    if (this.ehAdmin()) {
      base.splice(2, 0, { chave: 'responsavelUeNome', titulo: 'Responsável pela UE', larguraMin: '180px' });
    }
    return base;
  });

  agendasNoEscopo = computed(() => {
    const perfil = this.escopo.perfil();
    if (perfil === 'GERES') {
      return this.agendas().filter((a) => a.geresNome === this.escopo.vinculoNome());
    }
    if (perfil === 'GRAMB') {
      const idsCentral = new Set(UES_MOCK.filter((u) => u.nivelRegulacao === 'central').map((u) => u.id));
      return this.agendas().filter((a) => idsCentral.has(a.ueId));
    }
    return this.agendas(); // Administrador vê todas
  });

  filtrados = computed(() => {
    const termo = this.termoSignal().toLowerCase();
    const status = this.statusSignal();
    return this.agendasNoEscopo().filter((a) => {
      const bateTermo = !termo || a.ueNome.toLowerCase().includes(termo);
      const bateStatus = !status || a.status === status;
      return bateTermo && bateStatus;
    });
  });

  linhas = computed<LinhaAgenda[]>(() =>
    this.filtrados().map((a) => ({
      ueNome: a.ueNome,
      municipioNome: a.municipioNome,
      responsavelUeNome: a.responsavelUeNome,
      especialidade: a.especialidade,
      periodo: a.periodo,
      vagas: `${a.vagasDisponiveis} / ${a.vagasTotais}`,
      status: a.status,
    })),
  );

  subtitulo = computed(() => {
    const perfil = this.escopo.perfil();
    if (perfil === 'GERES') return `Agendas enviadas pelas UEs da sua GERES (${this.agendasNoEscopo().length}).`;
    if (perfil === 'GRAMB') return `Agendas das UEs sob regulação central (${this.agendasNoEscopo().length}).`;
    return `Todas as agendas enviadas no sistema (${this.agendasNoEscopo().length}), com o responsável por cada UE.`;
  });

  constructor(
    private agendaService: AgendaService,
    private escopo: EscopoService,
  ) {
    this.agendaService.listar().subscribe((dados) => {
      this.agendas.set(dados);
      this.carregando.set(false);
    });
  }

  atualizarFiltro(): void {
    this.termoSignal.set(this.termo);
    this.statusSignal.set(this.statusSelecionado);
  }
}
