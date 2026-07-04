import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { StatusBadge } from '../../../shared/components/status-badge/status-badge';
import { NotificationService } from '../../../services/notification.service';
import { Agenda } from '../../../models';

export interface AgendaDetalheDialogData {
  agenda: Agenda;
}

@Component({
  selector: 'app-agenda-detalhe-dialog',
  standalone: true,
  imports: [FormsModule, MatDialogModule, StatusBadge],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 mat-dialog-title>Detalhes da agenda</h2>
    <div mat-dialog-content class="conteudo">
      <div class="cabecalho">
        <div>
          <strong>{{ data.agenda.especialidade }}</strong>
          <span>{{ data.agenda.ueNome }} · {{ data.agenda.municipioNome }} ({{ data.agenda.geresNome }})</span>
        </div>
        <app-status-badge [status]="data.agenda.status" />
      </div>

      <div class="resumo-final">
        <div class="resumo-final__linha"><span>Profissional</span><strong>{{ data.agenda.profissionalNome }}</strong></div>
        <div class="resumo-final__linha"><span>Período</span><strong>{{ data.agenda.periodo }}</strong></div>
        <div class="resumo-final__linha"><span>Vagas</span><strong>{{ data.agenda.vagasDisponiveis }} / {{ data.agenda.vagasTotais }}</strong></div>
        <div class="resumo-final__linha"><span>Responsável pela UE</span><strong>{{ data.agenda.responsavelUeNome }}</strong></div>
        <div class="resumo-final__linha"><span>Enviada por</span><strong>{{ data.agenda.enviadaPor }}</strong></div>
        <div class="resumo-final__linha"><span>Data de envio</span><strong>{{ data.agenda.dataEnvio }}</strong></div>
        <div class="resumo-final__linha"><span>Vezes reenviada</span><strong>{{ data.agenda.vezesReenviada }}</strong></div>
      </div>

      @if (data.agenda.observacaoFeriado) {
        <div class="observacao observacao--feriado">
          <span class="material-icons-round">event_busy</span>
          {{ data.agenda.observacaoFeriado }}
        </div>
      }

      @if (data.agenda.inconsistencias.length > 0) {
        <div class="lista-inconsistencias">
          @for (i of data.agenda.inconsistencias; track i) {
            <div class="observacao observacao--pendencia">
              <span class="material-icons-round">warning</span>
              {{ i }}
            </div>
          }
        </div>
      }

      @if (data.agenda.motivoDevolucao) {
        <div class="observacao observacao--devolucao">
          <span class="material-icons-round">assignment_return</span>
          Motivo da devolução anterior: {{ data.agenda.motivoDevolucao }}
        </div>
      }

      @if (mostrarFormularioDevolucao()) {
        <label class="campo" style="margin-top:14px">
          <span>Motivo da devolução</span>
          <textarea rows="3" [(ngModel)]="motivo" placeholder="Explique o que precisa ser corrigido pela unidade..."></textarea>
        </label>
      }
    </div>

    <div mat-dialog-actions class="acoes">
      <button class="btn-secondary" (click)="exportarCmce()">
        <span class="material-icons-round">file_download</span>
        Exportar para CMCE
      </button>
      @if (!mostrarFormularioDevolucao()) {
        @if (data.agenda.status !== 'devolvida') {
          <button class="btn-secondary" (click)="mostrarFormularioDevolucao.set(true)">
            <span class="material-icons-round">assignment_return</span>
            Devolver agenda
          </button>
        }
        <button class="btn-primary" (click)="ref.close(null)">Fechar</button>
      } @else {
        <button class="btn-secondary" (click)="mostrarFormularioDevolucao.set(false)">Cancelar</button>
        <button class="btn-primary" [disabled]="!motivo()" (click)="confirmarDevolucao()">
          <span class="material-icons-round">send</span>
          Confirmar devolução
        </button>
      }
    </div>
  `,
  styleUrl: './agenda-detalhe-dialog.scss',
})
export class AgendaDetalheDialog {
  ref = inject(MatDialogRef<AgendaDetalheDialog>);
  data = inject<AgendaDetalheDialogData>(MAT_DIALOG_DATA);
  private notify = inject(NotificationService);

  mostrarFormularioDevolucao = signal(false);
  motivo = signal('');

  exportarCmce(): void {
    this.notify.info(`Agenda de ${this.data.agenda.ueNome} exportada para registro no CMCE.`);
  }

  confirmarDevolucao(): void {
    this.ref.close({ devolvida: true, motivo: this.motivo() });
  }
}
