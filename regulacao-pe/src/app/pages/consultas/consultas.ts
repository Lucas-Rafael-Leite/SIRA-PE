import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Breadcrumb } from '../../shared/components/breadcrumb/breadcrumb';
import { DataTable, ColunaTabela } from '../../shared/components/data-table/data-table';
import { ConsultaService } from '../../services/consulta.service';
import { NotificationService } from '../../services/notification.service';
import { EscopoService } from '../../core/services/escopo.service';
import { AuthService } from '../../core/services/auth.service';
import { ESPECIALIDADES_MOCK } from '../../mock';
import { Consulta } from '../../models';
import { CancelarConsultaDialog } from './dialogs/cancelar-consulta-dialog';
import { MarcarConsultaDialog } from './dialogs/marcar-consulta-dialog';

interface LinhaConsulta extends Record<string, unknown> {
  protocolo: string;
  pacienteNome: string;
  especialidade: string;
  ueNome: string;
  municipioNome: string;
  data: string;
  status: string;
  __id: string;
}

@Component({
  selector: 'app-consultas',
  standalone: true,
  imports: [FormsModule, MatDialogModule, Breadcrumb, DataTable],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="sira-page sira-fade-in">
      <app-breadcrumb [itens]="[{ label: 'Dashboard', route: '/home' }, { label: 'Consultas' }]" />

      <div class="sira-page-header">
        <div class="sira-page-header__title">
          <span class="sira-eyebrow">Regulação de acesso</span>
          <h1>Consultas</h1>
          <p>{{ linhas().length }} consulta(s) no seu escopo de visualização.</p>
        </div>
        <button class="btn-primary" (click)="abrirMarcarConsulta()">
          <span class="material-icons-round">add</span>
          Marcar consulta
        </button>
      </div>

      <div class="sira-card sira-toolbar">
        <div class="filtro-busca">
          <span class="material-icons-round">search</span>
          <input type="text" placeholder="Buscar paciente ou protocolo..." [(ngModel)]="termo" (ngModelChange)="atualizarFiltro()" />
        </div>
        <select class="filtro-select" [(ngModel)]="especialidadeSelecionada" (ngModelChange)="atualizarFiltro()">
          <option value="">Todas as especialidades</option>
          @for (e of especialidades; track e) {
            <option [value]="e">{{ e }}</option>
          }
        </select>
        <select class="filtro-select" [(ngModel)]="statusSelecionado" (ngModelChange)="atualizarFiltro()">
          <option value="">Todos os status</option>
          <option value="agendada">Agendada</option>
          <option value="confirmada">Confirmada</option>
          <option value="realizada">Realizada</option>
          <option value="cancelada">Cancelada</option>
          <option value="faltou">Faltou</option>
        </select>
      </div>

      <app-data-table
        [dados]="linhas()"
        [colunas]="colunas"
        [carregando]="carregando()"
        [acoesTemplate]="acoesTpl"
        [tamanhoPagina]="10"
      />

      <ng-template #acoesTpl let-linha>
        <button
          class="link-btn"
          [disabled]="linha.status === 'cancelada' || linha.status === 'realizada'"
          (click)="cancelar(linha)"
        >
          Cancelar
        </button>
      </ng-template>
    </div>
  `,
})
export class Consultas {
  especialidades = ESPECIALIDADES_MOCK;

  consultas = signal<Consulta[]>([]);
  carregando = signal(true);
  termo = '';
  especialidadeSelecionada = '';
  statusSelecionado = '';

  private termoSignal = signal('');
  private especialidadeSignal = signal('');
  private statusSignal = signal('');

  colunas: ColunaTabela<LinhaConsulta>[] = [
    { chave: 'protocolo', titulo: 'Protocolo' },
    { chave: 'pacienteNome', titulo: 'Paciente', tipo: 'destaque', larguraMin: '180px' },
    { chave: 'especialidade', titulo: 'Especialidade' },
    { chave: 'ueNome', titulo: 'Unidade', larguraMin: '200px' },
    { chave: 'municipioNome', titulo: 'Município' },
    { chave: 'data', titulo: 'Data' },
    { chave: 'status', titulo: 'Status', tipo: 'badge' },
  ];

  noEscopo = computed(() => this.escopo.filtrarPorHierarquia(this.consultas()));

  filtrados = computed(() => {
    const termo = this.termoSignal().toLowerCase();
    const esp = this.especialidadeSignal();
    const status = this.statusSignal();
    return this.noEscopo().filter((c) => {
      const bateTermo = !termo || c.pacienteNome.toLowerCase().includes(termo) || c.protocolo.toLowerCase().includes(termo);
      const bateEsp = !esp || c.especialidade === esp;
      const bateStatus = !status || c.status === status;
      return bateTermo && bateEsp && bateStatus;
    });
  });

  linhas = computed<LinhaConsulta[]>(() =>
    this.filtrados().map((c) => ({
      __id: c.id,
      protocolo: c.protocolo,
      pacienteNome: c.pacienteNome,
      especialidade: c.especialidade,
      ueNome: c.ueNome,
      municipioNome: c.municipioNome,
      data: `${c.data} ${c.hora}`,
      status: c.status,
    })),
  );

  constructor(
    private consultaService: ConsultaService,
    private dialog: MatDialog,
    private notify: NotificationService,
    private escopo: EscopoService,
    private auth: AuthService,
  ) {
    this.carregar();
  }

  private carregar(): void {
    this.consultaService.listar().subscribe((dados) => {
      this.consultas.set(dados);
      this.carregando.set(false);
    });
  }

  atualizarFiltro(): void {
    this.termoSignal.set(this.termo);
    this.especialidadeSignal.set(this.especialidadeSelecionada);
    this.statusSignal.set(this.statusSelecionado);
  }

  abrirMarcarConsulta(): void {
    const ref = this.dialog.open(MarcarConsultaDialog, { width: '520px' });
    ref.afterClosed().subscribe((resultado) => {
      if (resultado) {
        this.consultaService.marcarComVaga(resultado, this.auth.usuario());
        this.notify.sucesso('Consulta marcada com sucesso.');
        this.carregar();
      }
    });
  }

  cancelar(linha: LinhaConsulta): void {
    const consulta = this.consultas().find((c) => c.id === linha['__id']);
    if (!consulta) return;

    const ref = this.dialog.open(CancelarConsultaDialog, {
      width: '480px',
      data: { consulta },
    });
    ref.afterClosed().subscribe((resultado) => {
      if (resultado) {
        this.consultaService.cancelar(consulta.id, resultado.motivo, this.auth.usuario());
        this.notify.sucesso('Consulta cancelada com sucesso.');
        this.carregar();
      }
    });
  }
}
