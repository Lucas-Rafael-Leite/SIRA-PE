import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { NotificationService } from '../../../services/notification.service';
import { Agenda } from '../../../models';
import { gerarAgendaCompleta } from '../../../shared/utils/agenda-completa.util';

export interface AgendaCompletaDialogData {
  agenda: Agenda;
}

@Component({
  selector: 'app-agenda-completa-dialog',
  standalone: true,
  imports: [MatDialogModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 mat-dialog-title>Agenda completa</h2>
    <div mat-dialog-content class="conteudo">
      <p class="aviso">
        <span class="material-icons-round">description</span>
        Reconstituição da agenda no mesmo layout enviado pela unidade executante, a partir dos dados cadastrados no sistema.
      </p>

      <div class="folha">
        <div class="folha__cabecalho">
          <strong>{{ dados().hospitalNome }}</strong>
          <span>Agenda de consultas para regulação do Estado de Pernambuco</span>
          <span class="mes">{{ dados().mesReferencia }}</span>
        </div>

        <div class="folha__meta">
          <div><span>Especialidade/Exame</span><strong>{{ dados().especialidade }}</strong></div>
          <div><span>CBO do especialista</span><strong>{{ dados().cbo }}</strong></div>
        </div>

        <table class="tabela-agenda">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Segunda-feira</th>
              <th>Terça-feira</th>
              <th>Quarta-feira</th>
              <th>Quinta-feira</th>
              <th>Sexta-feira</th>
            </tr>
          </thead>
          <tbody>
            @for (linha of dados().linhas; track linha.profissionalNome) {
              <tr>
                <td class="celula-nome">
                  <strong>{{ linha.profissionalNome }}</strong>
                  <span>Início do atendimento: {{ linha.horarioInicio }}</span>
                </td>
                @for (dia of diasSemana; track dia) {
                  <td [class.celula-ativa]="dia === linha.diaSemana">
                    @if (dia === linha.diaSemana) {
                      @for (d of linha.datas; track d.data) {
                        <div class="linha-data">{{ d.data }} – VAGAS ({{ pad(d.vagas) }})</div>
                      }
                    }
                  </td>
                }
              </tr>
            }
          </tbody>
        </table>

        @if (dados().observacoes.length > 0) {
          <div class="folha__obs">
            <strong>OBS:</strong>
            <ul>
              @for (o of dados().observacoes; track o) {
                <li>{{ o }}</li>
              }
            </ul>
          </div>
        }
      </div>
    </div>

    <div mat-dialog-actions class="acoes">
      <button class="btn-secondary" (click)="baixar()">
        <span class="material-icons-round">file_download</span>
        Baixar espelho da agenda
      </button>
      <button class="btn-primary" (click)="ref.close()">Fechar</button>
    </div>
  `,
  styleUrl: './agenda-completa-dialog.scss',
})
export class AgendaCompletaDialog {
  ref = inject(MatDialogRef<AgendaCompletaDialog>);
  data = inject<AgendaCompletaDialogData>(MAT_DIALOG_DATA);
  private notify = inject(NotificationService);

  readonly diasSemana = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira'] as const;

  dados = computed(() => gerarAgendaCompleta(this.data.agenda));

  pad(n: number): string {
    return String(n).padStart(2, '0');
  }

  baixar(): void {
    this.notify.info(`Espelho da agenda de ${this.data.agenda.ueNome} baixado.`);
  }
}
