import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Breadcrumb } from '../../shared/components/breadcrumb/breadcrumb';
import { DataTable, ColunaTabela } from '../../shared/components/data-table/data-table';
import { MunicipioService } from '../../services/municipio.service';
import { EscopoService } from '../../core/services/escopo.service';
import { GERES_MOCK } from '../../mock';
import { Municipio } from '../../models';

interface LinhaMunicipio extends Record<string, unknown> {
  nome: string;
  geresNome: string;
  habitantes: string;
  consultasMes: string;
  indicadorOcupacao: string;
  __id: string;
}

@Component({
  selector: 'app-municipios',
  standalone: true,
  imports: [FormsModule, Breadcrumb, DataTable],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="sira-page sira-fade-in">
      <app-breadcrumb [itens]="[{ label: 'Dashboard', route: '/home' }, { label: 'Municípios' }]" />

      <div class="sira-page-header">
        <div class="sira-page-header__title">
          <span class="sira-eyebrow">Regulação estadual</span>
          <h1>Municípios</h1>
          <p>{{ municipiosNoEscopo().length }} município(s) no seu escopo de visualização.</p>
        </div>
      </div>

      <div class="sira-card sira-toolbar">
        <div class="filtro-busca">
          <span class="material-icons-round">search</span>
          <input type="text" placeholder="Buscar município..." [(ngModel)]="termo" />
        </div>
        <select class="filtro-select" [(ngModel)]="geresSelecionada">
          <option value="">Todas as GERES</option>
          @for (g of geresLista; track g.id) {
            <option [value]="g.nome">{{ g.nome }}</option>
          }
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
  styleUrl: './municipios.scss',
})
export class Municipios {
  geresLista = GERES_MOCK;
  municipios = signal<Municipio[]>([]);
  carregando = signal(true);
  termo = '';
  geresSelecionada = '';

  colunas: ColunaTabela<LinhaMunicipio>[] = [
    { chave: 'nome', titulo: 'Município', tipo: 'destaque', larguraMin: '180px' },
    { chave: 'geresNome', titulo: 'GERES', larguraMin: '200px' },
    { chave: 'habitantes', titulo: 'Habitantes' },
    { chave: 'consultasMes', titulo: 'Consultas/mês' },
    { chave: 'indicadorOcupacao', titulo: 'Ocupação' },
  ];

  municipiosNoEscopo = computed(() => this.escopo.filtrarMunicipios(this.municipios()));

  filtrados = computed(() => {
    const termo = this.termoSignal();
    const geres = this.geresSignal();
    return this.municipiosNoEscopo().filter((m) => {
      const bateTermo = !termo || m.nome.toLowerCase().includes(termo.toLowerCase());
      const bateGeres = !geres || m.geresNome === geres;
      return bateTermo && bateGeres;
    });
  });

  linhas = computed<LinhaMunicipio[]>(() =>
    this.filtrados().map((m) => ({
      __id: m.id,
      nome: m.nome,
      geresNome: m.geresNome,
      habitantes: m.habitantes.toLocaleString('pt-BR'),
      consultasMes: m.consultasMes.toLocaleString('pt-BR'),
      indicadorOcupacao: m.indicadorOcupacao + '%',
    })),
  );

  private termoSignal = signal('');
  private geresSignal = signal('');

  constructor(
    private municipioService: MunicipioService,
    private router: Router,
    private escopo: EscopoService,
  ) {
    this.municipioService.listar().subscribe((dados) => {
      this.municipios.set(dados);
      this.carregando.set(false);
    });
  }

  ngDoCheck(): void {
    this.termoSignal.set(this.termo);
    this.geresSignal.set(this.geresSelecionada);
  }

  abrirDetalhe(linha: LinhaMunicipio): void {
    this.router.navigate(['/municipios', linha['__id']]);
  }
}
