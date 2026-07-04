import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Breadcrumb } from '../../shared/components/breadcrumb/breadcrumb';
import { StatusBadge } from '../../shared/components/status-badge/status-badge';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { LoadingSkeleton } from '../../shared/components/loading-skeleton/loading-skeleton';
import { AlertaService } from '../../services/alerta.service';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../core/services/auth.service';
import { Alerta } from '../../models';
import { EnviarAlertaDialog } from './dialogs/enviar-alerta-dialog';

type Aba = 'recebidos' | 'enviados';

@Component({
  selector: 'app-alertas',
  standalone: true,
  imports: [FormsModule, MatDialogModule, Breadcrumb, StatusBadge, EmptyState, LoadingSkeleton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="sira-page sira-fade-in">
      <app-breadcrumb [itens]="[{ label: 'Dashboard', route: '/home' }, { label: 'Alertas' }]" />

      <div class="sira-page-header">
        <div class="sira-page-header__title">
          <span class="sira-eyebrow">Comunicação da regulação</span>
          <h1>Alertas</h1>
          <p>{{ subtitulo() }}</p>
        </div>
        @if (podeEnviar()) {
          <button class="btn-primary" (click)="abrirEnviarAlerta()">
            <span class="material-icons-round">campaign</span>
            Enviar alerta
          </button>
        }
      </div>

      @if (podeEnviar()) {
        <div class="tabs">
          <button class="tabs__item" [class.tabs__item--ativo]="aba() === 'recebidos'" (click)="aba.set('recebidos')">
            Recebidos
          </button>
          <button class="tabs__item" [class.tabs__item--ativo]="aba() === 'enviados'" (click)="aba.set('enviados')">
            Histórico enviado por mim
          </button>
        </div>
      }

      <div class="sira-card sira-toolbar">
        <select class="filtro-select" [(ngModel)]="prioridadeSelecionada" (ngModelChange)="atualizarFiltro()">
          <option value="">Todas as prioridades</option>
          <option value="baixa">Baixa</option>
          <option value="media">Média</option>
          <option value="alta">Alta</option>
          <option value="critica">Crítica</option>
        </select>
      </div>

      @if (carregando()) {
        <app-loading-skeleton variante="linha" [quantidade]="6" />
      } @else if (filtrados().length === 0) {
        <app-empty-state icon="notifications_off" titulo="Nenhum alerta encontrado" />
      } @else {
        <div class="alertas-lista">
          @for (a of filtrados(); track a.id) {
            <div class="sira-card alerta-card" [class.alerta-card--lido]="a.lido">
              <span class="material-icons-round alerta-card__icon" [class]="'alerta-card__icon--' + a.prioridade">campaign</span>
              <div class="alerta-card__corpo">
                <div class="alerta-card__topo">
                  <strong>{{ a.titulo }}</strong>
                  <app-status-badge [status]="a.prioridade" />
                </div>
                <p>{{ a.mensagem }}</p>
                <span class="alerta-card__meta">
                  Destino: {{ a.destinoNome }} · Enviado por {{ a.autor }} ({{ rotuloPerfil(a.autorPerfil) }}) em {{ a.dataEnvio }}
                </span>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styleUrl: './alertas.scss',
})
export class Alertas {
  todos = signal<Alerta[]>([]);
  carregando = signal(true);
  aba = signal<Aba>('recebidos');
  prioridadeSelecionada = '';
  private prioridadeSignal = signal('');

  podeEnviar = computed(() => this.alertaService.podeEnviar(this.auth.usuario()));

  listaBase = computed<Alerta[]>(() => {
    const usuario = this.auth.usuario();
    if (this.podeEnviar() && this.aba() === 'enviados') {
      return this.alertaService.enviadosPor(usuario);
    }
    return this.alertaService.recebidosPor(usuario);
  });

  filtrados = computed(() => {
    const prioridade = this.prioridadeSignal();
    return this.listaBase().filter((a) => !prioridade || a.prioridade === prioridade);
  });

  subtitulo = computed(() => {
    const perfil = this.auth.perfil();
    if (perfil === 'UnidadeExecutante' || perfil === 'Municipio') {
      return 'Notificações de alertas enviados para você pela regulação estadual.';
    }
    return `${this.listaBase().length} alerta(s) na aba atual.`;
  });

  constructor(
    private alertaService: AlertaService,
    private dialog: MatDialog,
    private notify: NotificationService,
    public auth: AuthService,
  ) {
    this.carregar();
  }

  private carregar(): void {
    this.alertaService.listar().subscribe(() => {
      // O AlertaService mantém o estado em memória; aqui apenas sincronizamos o loading.
      this.todos.set([]);
      this.carregando.set(false);
    });
  }

  atualizarFiltro(): void {
    this.prioridadeSignal.set(this.prioridadeSelecionada);
  }

  rotuloPerfil(perfil: string): string {
    const mapa: Record<string, string> = {
      Administrador: 'Administrador',
      GRAMB: 'GRAMB',
      GERES: 'GERES',
      Municipio: 'Município',
      UnidadeExecutante: 'Unidade Executante',
    };
    return mapa[perfil] ?? perfil;
  }

  abrirEnviarAlerta(): void {
    const autor = this.auth.usuario();
    if (!autor) return;
    const ref = this.dialog.open(EnviarAlertaDialog, { width: '480px', data: { autor } });
    ref.afterClosed().subscribe((resultado) => {
      if (resultado) {
        this.alertaService.enviar(resultado, autor);
        this.notify.sucesso('Alerta enviado com sucesso.');
        this.aba.set('enviados');
      }
    });
  }
}
