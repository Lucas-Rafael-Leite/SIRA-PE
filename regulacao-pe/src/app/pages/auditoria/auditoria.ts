import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Breadcrumb } from '../../shared/components/breadcrumb/breadcrumb';
import { DataTable, ColunaTabela } from '../../shared/components/data-table/data-table';
import { AuditoriaService } from '../../services/auditoria.service';
import { RegistroAuditoria } from '../../models';

interface LinhaAuditoria extends Record<string, unknown> {
  usuario: string;
  perfil: string;
  operacao: string;
  modulo: string;
  data: string;
  ip: string;
}

@Component({
  selector: 'app-auditoria',
  standalone: true,
  imports: [FormsModule, Breadcrumb, DataTable],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="sira-page sira-fade-in">
      <app-breadcrumb [itens]="[{ label: 'Dashboard', route: '/home' }, { label: 'Auditoria' }]" />

      <div class="sira-page-header">
        <div class="sira-page-header__title">
          <span class="sira-eyebrow">Rastreabilidade</span>
          <h1>Auditoria</h1>
          <p>Histórico de operações realizadas no sistema.</p>
        </div>
      </div>

      <div class="sira-card sira-toolbar">
        <div class="filtro-busca">
          <span class="material-icons-round">search</span>
          <input type="text" placeholder="Buscar usuário..." [(ngModel)]="termo" (ngModelChange)="atualizarFiltro()" />
        </div>
        <select class="filtro-select" [(ngModel)]="moduloSelecionado" (ngModelChange)="atualizarFiltro()">
          <option value="">Todos os módulos</option>
          <option value="Agendas">Agendas</option>
          <option value="Consultas">Consultas</option>
          <option value="Vagas">Vagas</option>
          <option value="Alertas">Alertas</option>
          <option value="Auditoria">Auditoria</option>
          <option value="Configurações">Configurações</option>
          <option value="Relatórios">Relatórios</option>
        </select>
      </div>

      <app-data-table [dados]="linhas()" [colunas]="colunas" [carregando]="carregando()" [tamanhoPagina]="12" />
    </div>
  `,
})
export class Auditoria {
  registros = signal<RegistroAuditoria[]>([]);
  carregando = signal(true);
  termo = '';
  moduloSelecionado = '';
  private termoSignal = signal('');
  private moduloSignal = signal('');

  colunas: ColunaTabela<LinhaAuditoria>[] = [
    { chave: 'data', titulo: 'Data/Hora', larguraMin: '140px' },
    { chave: 'usuario', titulo: 'Usuário', tipo: 'destaque', larguraMin: '160px' },
    { chave: 'perfil', titulo: 'Perfil' },
    { chave: 'operacao', titulo: 'Operação', larguraMin: '220px' },
    { chave: 'modulo', titulo: 'Módulo' },
    { chave: 'ip', titulo: 'IP de origem' },
  ];

  filtrados = computed(() => {
    const termo = this.termoSignal().toLowerCase();
    const modulo = this.moduloSignal();
    return this.registros().filter((r) => {
      const bateTermo = !termo || r.usuario.toLowerCase().includes(termo);
      const bateModulo = !modulo || r.modulo === modulo;
      return bateTermo && bateModulo;
    });
  });

  linhas = computed<LinhaAuditoria[]>(() =>
    this.filtrados().map((r) => ({
      data: r.data,
      usuario: r.usuario,
      perfil: r.perfil,
      operacao: r.operacao,
      modulo: r.modulo,
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
    this.moduloSignal.set(this.moduloSelecionado);
  }
}
