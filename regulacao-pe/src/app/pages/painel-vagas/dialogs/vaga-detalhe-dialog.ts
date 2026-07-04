import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { StatusBadge } from '../../../shared/components/status-badge/status-badge';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { VagaService } from '../../../services/vaga.service';
import { VagaLogService } from '../../../services/vaga-log.service';
import { AlertaVagaService } from '../../../services/alerta-vaga.service';
import { ConsultaService } from '../../../services/consulta.service';
import { NotificationService } from '../../../services/notification.service';
import { AuthService } from '../../../core/services/auth.service';
import { EscopoService } from '../../../core/services/escopo.service';
import { LogVaga, Vaga } from '../../../models';
import { MarcarConsultaDialog } from '../../consultas/dialogs/marcar-consulta-dialog';

export interface VagaDetalheDialogData {
  vaga: Vaga;
}

@Component({
  selector: 'app-vaga-detalhe-dialog',
  standalone: true,
  imports: [FormsModule, MatDialogModule, StatusBadge, EmptyState],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 mat-dialog-title>Detalhes da vaga</h2>
    <div mat-dialog-content class="conteudo">
      <div class="cabecalho">
        <div>
          <strong>{{ vaga().especialidade }}</strong>
          <span>{{ vaga().ueNome }} · {{ vaga().municipioNome }} ({{ vaga().geresNome }})</span>
        </div>
        <app-status-badge [status]="vaga().status" />
      </div>

      <div class="resumo-final">
        <div class="resumo-final__linha"><span>Profissional</span><strong>{{ vaga().profissionalNome }}</strong></div>
        <div class="resumo-final__linha"><span>Data / Horário</span><strong>{{ vaga().data }} · {{ vaga().hora }}</strong></div>
        <div class="resumo-final__linha"><span>Vaga estratégica</span><strong>{{ vaga().estrategica ? 'Sim' : 'Não' }}</strong></div>
        @if (vaga().pacienteNome) {
          <div class="resumo-final__linha"><span>Paciente</span><strong>{{ vaga().pacienteNome }}</strong></div>
        }
      </div>

      @if (vaga().status === 'disponivel') {
        <button class="btn-primary" style="margin-top:14px; width:100%" (click)="marcarConsulta()">
          <span class="material-icons-round">event_available</span>
          Marcar consulta para esta vaga
        </button>
      } @else if (vaga().status === 'agendada' && podeCancelar()) {
        <button class="btn-secondary" style="margin-top:14px; width:100%" (click)="cancelarVaga()">
          <span class="material-icons-round">event_busy</span>
          Cancelar esta vaga (liberar novamente)
        </button>
      }

      <div class="criar-alerta">
        <span>Quer ser avisado quando uma vaga assim abrir?</span>
        <button class="link-btn" (click)="criarAlerta()">Criar alerta para {{ vaga().especialidade }}</button>
      </div>

      <h3 class="titulo-logs">Histórico da vaga</h3>
      @if (logs().length === 0) {
        <app-empty-state icon="history" titulo="Nenhum registro ainda" descricao="Esta vaga ainda não possui histórico de eventos." />
      } @else {
        <div class="lista-logs">
          @for (l of logs(); track l.id) {
            <div class="log-item">
              <span class="material-icons-round log-item__icon" [class]="'log-item__icon--' + l.tipo">{{ iconePara(l.tipo) }}</span>
              <div class="log-item__corpo">
                <strong>{{ l.detalhe }}</strong>
                <span>{{ l.usuario }} ({{ rotuloPerfil(l.perfil) }}) · {{ l.data }}</span>
              </div>
            </div>
          }
        </div>
      }
    </div>

    <div mat-dialog-actions class="acoes">
      <button class="btn-secondary" (click)="ref.close()">Fechar</button>
    </div>
  `,
  styleUrl: './vaga-detalhe-dialog.scss',
})
export class VagaDetalheDialog implements OnInit {
  ref = inject(MatDialogRef<VagaDetalheDialog>);
  data = inject<VagaDetalheDialogData>(MAT_DIALOG_DATA);

  private vagaService = inject(VagaService);
  private vagaLogService = inject(VagaLogService);
  private alertaVagaService = inject(AlertaVagaService);
  private consultaService = inject(ConsultaService);
  private notify = inject(NotificationService);
  private auth = inject(AuthService);
  private escopo = inject(EscopoService);
  private dialog = inject(MatDialog);

  vaga = signal<Vaga>(this.data.vaga);
  logs = signal<LogVaga[]>([]);

  podeCancelar = computed(() => this.escopo.estaNoMeuEscopo(this.vaga()));

  ngOnInit(): void {
    this.vagaLogService.registrar(this.vaga().id, 'visualizacao', this.auth.usuario(), 'Visualizou os detalhes da vaga.');
    this.carregarLogs();
  }

  private carregarLogs(): void {
    this.vagaLogService.listarPorVaga(this.vaga().id).subscribe((l) => this.logs.set(l));
  }

  iconePara(tipo: string): string {
    const mapa: Record<string, string> = {
      visualizacao: 'visibility',
      marcacao: 'event_available',
      desmarcacao: 'event_busy',
      cancelamento: 'cancel',
      liberacao: 'lock_open',
    };
    return mapa[tipo] ?? 'history';
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

  marcarConsulta(): void {
    const ref = this.dialog.open(MarcarConsultaDialog, {
      width: '520px',
      data: { vagaPreSelecionada: this.vaga() },
    });
    ref.afterClosed().subscribe((resultado) => {
      if (resultado) {
        this.consultaService.marcarComVaga(resultado, this.auth.usuario());
        this.notify.sucesso('Consulta marcada com sucesso.');
        this.vaga.set({ ...this.vaga(), status: 'agendada', pacienteNome: resultado.pacienteNome });
        this.carregarLogs();
      }
    });
  }

  cancelarVaga(): void {
    this.vagaService.cancelar(this.vaga().id);
    this.vagaLogService.registrar(
      this.vaga().id,
      'cancelamento',
      this.auth.usuario(),
      'Vaga cancelada manualmente e liberada novamente para agendamento.',
    );
    this.notify.sucesso('Vaga cancelada e liberada novamente.');
    this.vaga.set({ ...this.vaga(), status: 'disponivel', pacienteNome: undefined });
    this.carregarLogs();
  }

  criarAlerta(): void {
    const usuario = this.auth.usuario();
    if (!usuario) return;
    const escopoNome =
      usuario.perfil === 'UnidadeExecutante' || usuario.perfil === 'Municipio' || usuario.perfil === 'GERES'
        ? usuario.vinculoNome
        : 'Estado de Pernambuco';
    this.alertaVagaService.criar(usuario, escopoNome, this.vaga().especialidade);
    this.notify.sucesso(`Você será notificado quando uma vaga de ${this.vaga().especialidade} abrir.`);
  }
}
