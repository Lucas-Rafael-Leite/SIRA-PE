import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Breadcrumb } from '../../shared/components/breadcrumb/breadcrumb';
import { DataTable, ColunaTabela } from '../../shared/components/data-table/data-table';
import { AuditoriaService } from '../../services/auditoria.service';
import { RegistroAuditoria } from '../../models';

interface LinhaAuditoria extends Record<string, unknown> {
  data: string;
  usuario: string;
  perfil: string;
  operacao: string;
  ip: string;
}

@Component({
  selector: 'app-auditoria-vagas',
  standalone: true,
  imports: [FormsModule, Breadcrumb, DataTable],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="sira-page sira-fade-in">
      <app-breadcrumb [itens]="[{ label: 'Dashboard', route: '/home' }, { label: 'Auditoria de Vagas' }]" />

      <div class="sira-page-header">
        <div class="sira-page-header__title">
          <span class="sira-eyebrow">Rastreabilidade de vagas</span>
          <h1>Auditoria de Vagas</h1>
          <p>Histórico de alterações no cadastro de vagas, disponível para todos os perfis.</p>
        </div>
      </div>

      <div class="sira-card sira-toolbar">
        <div class="filtro-busca">
          <span class="material-icons-round">search</span>
          <input type="text" placeholder="Buscar usuário..." [(ngModel)]="termo" (ngModelChange)="atualizarFiltro()" />
        </div>
      </div>

      <app-data-table [dados]="linhas()" [colunas]="colunas" [carregando]="carregando()" [tamanhoPagina]="12" />
    </div>
  `,
})
export class AuditoriaVagas {
  registros = signal<RegistroAuditoria[]>([]);
  carregando = signal(true);
  termo = '';
  private termoSignal = signal('');

  colunas: ColunaTabela<LinhaAuditoria>[] = [
    { chave: 'data', titulo: 'Data/Hora', larguraMin: '140px' },
    { chave: 'usuario', titulo: 'Usuário', tipo: 'destaque', larguraMin: '160px' },
    { chave: 'perfil', titulo: 'Perfil' },
    { chave: 'operacao', titulo: 'Operação', larguraMin: '220px' },
    { chave: 'ip', titulo: 'IP de origem' },
  ];

  registrosDeVagas = computed(() => this.registros().filter((r) => r.modulo === 'Vagas'));

  filtrados = computed(() => {
    const termo = this.termoSignal().toLowerCase();
    return this.registrosDeVagas().filter((r) => !termo || r.usuario.toLowerCase().includes(termo));
  });

  linhas = computed<LinhaAuditoria[]>(() =>
    this.filtrados().map((r) => ({
      data: r.data,
      usuario: r.usuario,
      perfil: r.perfil,
      operacao: r.operacao,
      ip: r.ip,
    })),
  );

  constructor(private auditoriaService: AuditoriaService) {
    this.auditoriaService.listar().subscribe((dados) => {
      this.registros.set(dados);
      this.carregando.set(false);
    });
  }

  atualizarFiltro(): void {
    this.termoSignal.set(this.termo);
  }
}
