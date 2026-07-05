import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Breadcrumb } from '../../shared/components/breadcrumb/breadcrumb';
import { DataTable, ColunaTabela } from '../../shared/components/data-table/data-table';
import { RelatorioService } from '../../services/relatorio.service';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../core/services/auth.service';
import { Relatorio } from '../../models';
import { CriarRelatorioDialog } from './dialogs/criar-relatorio-dialog';

interface LinhaRelatorio extends Record<string, unknown> {
  nome: string;
  tipo: string;
  geradoEm: string;
  geradoPor: string;
  tamanho: string;
  __id: string;
}

@Component({
  selector: 'app-relatorios',
  standalone: true,
  imports: [FormsModule, MatDialogModule, Breadcrumb, DataTable],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="sira-page sira-fade-in">
      <app-breadcrumb [itens]="[{ label: 'Dashboard', route: '/home' }, { label: 'Relatórios' }]" />

      <div class="sira-page-header">
        <div class="sira-page-header__title">
          <span class="sira-eyebrow">Gestão de informação</span>
          <h1>Relatórios</h1>
          <p>Gere e exporte relatórios consolidados da regulação ambulatorial.</p>
        </div>
        @if (ehAdmin()) {
          <button class="btn-primary" (click)="abrirCriarRelatorio()">
            <span class="material-icons-round">add</span>
            Criar relatório
          </button>
        }
      </div>

      <div class="sira-card sira-toolbar">
        <select class="filtro-select" [(ngModel)]="tipoSelecionado" (ngModelChange)="atualizarFiltro()">
          <option value="">Todos os tipos</option>
          <option value="Consultas">Consultas</option>
          <option value="Vagas">Vagas</option>
          <option value="Indicadores">Indicadores</option>
          <option value="Auditoria">Auditoria</option>
          <option value="Alertas">Alertas</option>
          <option value="Agendas">Agendas</option>
        </select>
      </div>

      <app-data-table
        [dados]="linhas()"
        [colunas]="colunas"
        [carregando]="carregando()"
        [acoesTemplate]="acoesTpl"
      />

      <ng-template #acoesTpl let-linha>
        <div class="acoes-relatorio">
          <button class="link-btn" (click)="baixar(linha, 'PDF')">PDF</button>
          <button class="link-btn" (click)="baixar(linha, 'Excel')">Excel</button>
          <button class="link-btn" (click)="baixar(linha, 'CSV')">CSV</button>
        </div>
      </ng-template>
    </div>
  `,
  styleUrl: './relatorios.scss',
})
export class Relatorios {
  relatorios = signal<Relatorio[]>([]);
  carregando = signal(true);
  tipoSelecionado = '';
  private tipoSignal = signal('');

  ehAdmin = computed(() => this.auth.perfil() === 'Administrador');

  colunas: ColunaTabela<LinhaRelatorio>[] = [
    { chave: 'nome', titulo: 'Relatório', tipo: 'destaque', larguraMin: '260px' },
    { chave: 'tipo', titulo: 'Tipo' },
    { chave: 'geradoEm', titulo: 'Gerado em' },
    { chave: 'geradoPor', titulo: 'Gerado por' },
    { chave: 'tamanho', titulo: 'Tamanho' },
  ];

  filtrados = computed(() => {
    const tipo = this.tipoSignal();
    return this.relatorios().filter((r) => !tipo || r.tipo === tipo);
  });

  linhas = computed<LinhaRelatorio[]>(() =>
    this.filtrados().map((r) => ({ ...r, __id: r.id })),
  );

  constructor(
    private relatorioService: RelatorioService,
    private notify: NotificationService,
    private auth: AuthService,
    private dialog: MatDialog,
  ) {
    this.carregar();
  }

  private carregar(): void {
    this.relatorioService.listar().subscribe((dados) => {
      this.relatorios.set(dados);
      this.carregando.set(false);
    });
  }

  atualizarFiltro(): void {
    this.tipoSignal.set(this.tipoSelecionado);
  }

  baixar(linha: LinhaRelatorio, formato: string): void {
    this.notify.info(`Exportação simulada de "${linha['nome']}" em ${formato} gerada.`);
  }

  abrirCriarRelatorio(): void {
    const ref = this.dialog.open(CriarRelatorioDialog, { width: '460px' });
    ref.afterClosed().subscribe((resultado) => {
      if (resultado) {
        this.relatorioService.criar(resultado, this.auth.usuario()?.nome ?? 'Administrador');
        this.notify.sucesso('Relatório criado com sucesso.');
        this.carregar();
      }
    });
  }
}
