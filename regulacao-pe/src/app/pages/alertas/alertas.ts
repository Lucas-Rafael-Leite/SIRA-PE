import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Breadcrumb } from '../../shared/components/breadcrumb/breadcrumb';
import { StatusBadge } from '../../shared/components/status-badge/status-badge';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { LoadingSkeleton } from '../../shared/components/loading-skeleton/loading-skeleton';
import { AlertaService } from '../../services/alerta.service';
import { NotificationService } from '../../services/notification.service';
import { Alerta } from '../../models';
import { EnviarAlertaDialog } from './dialogs/enviar-alerta-dialog';

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
          <p>{{ alertas().length }} alertas emitidos · {{ naoLidos() }} não lidos.</p>
        </div>
        <button class="btn-primary" (click)="abrirEnviarAlerta()">
          <span class="material-icons-round">campaign</span>
          Enviar alerta
        </button>
      </div>

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
                  Destino: {{ a.destinoNome }} · Enviado por {{ a.autor }} em {{ a.dataEnvio }}
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
  alertas = signal<Alerta[]>([]);
  carregando = signal(true);
  prioridadeSelecionada = '';
  private prioridadeSignal = signal('');

  filtrados = computed(() => {
    const prioridade = this.prioridadeSignal();
    return this.alertas().filter((a) => !prioridade || a.prioridade === prioridade);
  });

  naoLidos = computed(() => this.alertas().filter((a) => !a.lido).length);

  constructor(
    private alertaService: AlertaService,
    private dialog: MatDialog,
    private notify: NotificationService,
  ) {
    this.carregar();
  }

  private carregar(): void {
    this.alertaService.listar().subscribe((dados) => {
      this.alertas.set(dados);
      this.carregando.set(false);
    });
  }

  atualizarFiltro(): void {
    this.prioridadeSignal.set(this.prioridadeSelecionada);
  }

  abrirEnviarAlerta(): void {
    const ref = this.dialog.open(EnviarAlertaDialog, { width: '480px' });
    ref.afterClosed().subscribe((resultado) => {
      if (resultado) {
        this.alertaService.enviar(resultado);
        this.notify.sucesso('Alerta enviado com sucesso.');
        this.carregar();
      }
    });
  }
}
