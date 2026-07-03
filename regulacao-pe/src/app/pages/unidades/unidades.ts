import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Breadcrumb } from '../../shared/components/breadcrumb/breadcrumb';
import { DataTable, ColunaTabela } from '../../shared/components/data-table/data-table';
import { UeService } from '../../services/ue.service';
import { UnidadeExecutante } from '../../models';

interface LinhaUe extends Record<string, unknown> {
  nome: string;
  municipioNome: string;
  tipo: string;
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
          <p>{{ ues().length }} unidades cadastradas na rede estadual.</p>
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
      </div>

      <app-data-table
        [dados]="linhas()"
        [colunas]="colunas"
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

  private termoSignal = signal('');
  private statusSignal = signal('');

  colunas: ColunaTabela<LinhaUe>[] = [
    { chave: 'nome', titulo: 'Unidade', tipo: 'destaque', larguraMin: '220px' },
    { chave: 'municipioNome', titulo: 'Município' },
    { chave: 'tipo', titulo: 'Tipo' },
    { chave: 'status', titulo: 'Status', tipo: 'badge' },
    { chave: 'vagas', titulo: 'Vagas disponíveis' },
  ];

  filtrados = computed(() => {
    const termo = this.termoSignal().toLowerCase();
    const status = this.statusSignal();
    return this.ues().filter((u) => {
      const bateTermo = !termo || u.nome.toLowerCase().includes(termo) || u.municipioNome.toLowerCase().includes(termo);
      const bateStatus = !status || u.status === status;
      return bateTermo && bateStatus;
    });
  });

  linhas = computed<LinhaUe[]>(() =>
    this.filtrados().map((u) => ({
      __id: u.id,
      nome: u.nome,
      municipioNome: u.municipioNome,
      tipo: u.tipo,
      status: u.status,
      vagas: `${u.vagasDisponiveis} / ${u.vagasTotais}`,
    })),
  );

  constructor(
    private ueService: UeService,
    private router: Router,
  ) {
    this.ueService.listar().subscribe((dados) => {
      this.ues.set(dados);
      this.carregando.set(false);
    });
  }

  atualizarFiltro(): void {
    this.termoSignal.set(this.termo);
    this.statusSignal.set(this.statusSelecionado);
  }

  abrirDetalhe(linha: LinhaUe): void {
    this.router.navigate(['/unidades', linha['__id']]);
  }
}
