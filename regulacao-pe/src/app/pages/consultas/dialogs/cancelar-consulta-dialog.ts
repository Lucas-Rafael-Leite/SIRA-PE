import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { StatusBadge } from '../../../shared/components/status-badge/status-badge';
import { Consulta } from '../../../models';

export interface CancelarConsultaDialogData {
  consulta: Consulta;
}

@Component({
  selector: 'app-cancelar-consulta-dialog',
  standalone: true,
  imports: [FormsModule, MatDialogModule, StatusBadge],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 mat-dialog-title>Cancelar consulta</h2>
    <div mat-dialog-content class="conteudo">
      <div class="resumo">
        <div>
          <strong>{{ data.consulta.pacienteNome }}</strong>
          <span>{{ data.consulta.especialidade }} · {{ data.consulta.ueNome }}</span>
          <span>{{ data.consulta.data }} às {{ data.consulta.hora }} · Protocolo {{ data.consulta.protocolo }}</span>
        </div>
        <app-status-badge [status]="data.consulta.status" />
      </div>

      <label class="campo">
        <span>Motivo do cancelamento</span>
        <select [(ngModel)]="motivo">
          <option value="">Selecione um motivo</option>
          <option value="Paciente desistiu">Paciente desistiu</option>
          <option value="Reagendamento solicitado">Reagendamento solicitado</option>
          <option value="Indisponibilidade do profissional">Indisponibilidade do profissional</option>
          <option value="Inconsistência na agenda">Inconsistência na agenda</option>
          <option value="Outro">Outro</option>
        </select>
      </label>

      <label class="campo">
        <span>Observações (opcional)</span>
        <textarea rows="3" [(ngModel)]="observacoes" placeholder="Detalhe o motivo do cancelamento..."></textarea>
      </label>
    </div>

    <div mat-dialog-actions class="acoes">
      <button class="btn-secondary" (click)="ref.close(false)">Voltar</button>
      <button class="btn-danger" [disabled]="!motivo()" (click)="confirmar()">
        <span class="material-icons-round">event_busy</span>
        Confirmar cancelamento
      </button>
    </div>
  `,
  styleUrl: './cancelar-consulta-dialog.scss',
})
export class CancelarConsultaDialog {
  data = inject<CancelarConsultaDialogData>(MAT_DIALOG_DATA);
  ref = inject(MatDialogRef<CancelarConsultaDialog>);

  motivo = signal('');
  observacoes = signal('');

  confirmar(): void {
    this.ref.close({ motivo: this.motivo(), observacoes: this.observacoes() });
  }
}
