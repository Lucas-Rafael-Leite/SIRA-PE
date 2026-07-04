import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Breadcrumb } from '../../shared/components/breadcrumb/breadcrumb';
import { DataTable, ColunaTabela } from '../../shared/components/data-table/data-table';
import { UeService } from '../../services/ue.service';
import { EscopoService } from '../../core/services/escopo.service';
import { UnidadeExecutante } from '../../models';

interface LinhaUe extends Record<string, unknown> {
  nome: string;
  municipioNome: string;
  tipo: string;
  nivelRegulacao: string;
  status: string;
  vagas: string;
  __id: string;
}

@Component({
  selector: 'app-unidades',
  standalone: true,
  imports: [FormsModule, Breadcrumb, DataTable],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="sira-page sira-fade-in">
      <app-breadcrumb [itens]="[{ label: 'Dashboard', route: '/home' }, { label: 'Unidades Executantes' }]" />

      <div class="sira-page-header">
        <div class="sira-page-header__title">
          <span class="sira-eyebrow">Rede de execução</span>
          <h1>Unidades Executantes</h1>
          <p>{{ subtitulo() }}</p>
        </div>
      </div>

      <div class="sira-card sira-toolbar">
        <div class="filtro-busca">
          <span class="material-icons-round">search</span>
          <input type="text" placeholder="Buscar unidade ou município..." [(ngModel)]="termo" (ngModelChange)="atualizarFiltro()" />
        </div>
        <select class="filtro-select" [(ngModel)]="statusSelecionado" (ngModelChange)="atualizarFiltro()">
          <option value="">Todos os status</option>
          <option value="ativa">Ativa</option>
          <option value="manutencao">Manutenção</option>
          <option value="inativa">Inativa</option>
        </select>
        @if (ehGramb()) {
          <label class="switch-item" style="padding:0">
            <input type="checkbox" [(ngModel)]="apenasMinhas" (ngModelChange)="atualizarFiltro()" />
            <span>Mostrar apenas minhas UEs (regulação central)</span>
          </label>
        }
      </div>

      <app-data-table
        [dados]="linhas()"
        [colunas]="colunas()"
        [carregando]="carregando()"
        [acoesTemplate]="acoesTpl"
        (linhaClicada)="abrirDetalhe($event)"
      />

      <ng-template #acoesTpl let-linha>
        <button class="link-btn" (click)="abrirDetalhe(linha)">Detalhes</button>
      </ng-template>
    </div>
  `,
})
export class Unidades {
  ues = signal<UnidadeExecutante[]>([]);
  carregando = signal(true);
  termo = '';
  statusSelecionado = '';
  apenasMinhas = false;

  private termoSignal = signal('');
  private statusSignal = signal('');
  private apenasMinhasSignal = signal(false);

  ehGramb = computed(() => this.escopo.perfil() === 'GRAMB');

  colunas = computed<ColunaTabela<LinhaUe>[]>(() =>
    this.ehGramb()
      ? [
          { chave: 'nome', titulo: 'Unidade', tipo: 'destaque', larguraMin: '220px' },
          { chave: 'municipioNome', titulo: 'Município' },
          { chave: 'tipo', titulo: 'Tipo' },
          { chave: 'nivelRegulacao', titulo: 'Regulação', tipo: 'badge' },
          { chave: 'status', titulo: 'Status', tipo: 'badge' },
          { chave: 'vagas', titulo: 'Vagas disponíveis' },
        ]
      : [
          { chave: 'nome', titulo: 'Unidade', tipo: 'destaque', larguraMin: '220px' },
          { chave: 'municipioNome', titulo: 'Município' },
          { chave: 'tipo', titulo: 'Tipo' },
          { chave: 'status', titulo: 'Status', tipo: 'badge' },
          { chave: 'vagas', titulo: 'Vagas disponíveis' },
        ],
  );

  uesNoEscopo = computed(() => this.escopo.filtrarUes(this.ues()));

  filtrados = computed(() => {
    const termo = this.termoSignal().toLowerCase();
    const status = this.statusSignal();
    const apenasMinhas = this.apenasMinhasSignal();
    return this.uesNoEscopo().filter((u) => {
      const bateTermo = !termo || u.nome.toLowerCase().includes(termo) || u.municipioNome.toLowerCase().includes(termo);
      const bateStatus = !status || u.status === status;
      const bateResponsabilidade = !apenasMinhas || u.nivelRegulacao === 'central';
      return bateTermo && bateStatus && bateResponsabilidade;
    });
  });

  linhas = computed<LinhaUe[]>(() =>
    this.filtrados().map((u) => ({
      __id: u.id,
      nome: u.nome,
      municipioNome: u.municipioNome,
      tipo: u.tipo,
      nivelRegulacao: u.nivelRegulacao,
      status: u.status,
      vagas: `${u.vagasDisponiveis} / ${u.vagasTotais}`,
    })),
  );

  subtitulo = computed(() => {
    const perfil = this.escopo.perfil();
    if (perfil === 'Municipio') return `${this.uesNoEscopo().length} unidade(s) do seu município.`;
    if (perfil === 'GERES') return `${this.uesNoEscopo().length} unidade(s) sob responsabilidade da sua GERES.`;
    return `${this.uesNoEscopo().length} unidade(s) na rede estadual.`;
  });

  constructor(
    private ueService: UeService,
    private router: Router,
    private escopo: EscopoService,
  ) {
    this.ueService.listar().subscribe((dados) => {
      this.ues.set(dados);
      this.carregando.set(false);
    });
  }

  atualizarFiltro(): void {
    this.termoSignal.set(this.termo);
    this.statusSignal.set(this.statusSelecionado);
    this.apenasMinhasSignal.set(this.apenasMinhas);
  }

  abrirDetalhe(linha: LinhaUe): void {
    this.router.navigate(['/unidades', linha['__id']]);
  }
}
