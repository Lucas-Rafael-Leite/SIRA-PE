import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatStepperModule } from '@angular/material/stepper';
import { PACIENTES_MOCK, ESPECIALIDADES_MOCK, UES_MOCK } from '../../../mock';
import { Paciente, UnidadeExecutante } from '../../../models';

@Component({
  selector: 'app-marcar-consulta-dialog',
  standalone: true,
  imports: [FormsModule, MatDialogModule, MatStepperModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 mat-dialog-title>Marcar consulta</h2>
    <div mat-dialog-content class="conteudo">
      <mat-stepper linear #stepper>
        <mat-step label="Paciente" [completed]="!!pacienteSelecionado()">
          <label class="campo">
            <span>Buscar paciente</span>
            <input type="text" [(ngModel)]="termoPaciente" placeholder="Nome do paciente..." />
          </label>
          <div class="lista-selecao">
            @for (p of pacientesFiltrados(); track p.id) {
              <button
                class="item-selecao"
                [class.item-selecao--ativo]="pacienteSelecionado()?.id === p.id"
                (click)="pacienteSelecionado.set(p)"
              >
                <strong>{{ p.nome }}</strong>
                <span>Cartão SUS {{ p.cartaoSus }} · {{ p.municipioNome }}</span>
              </button>
            }
          </div>
          <div class="passo-acoes">
            <button class="btn-primary" [disabled]="!pacienteSelecionado()" matStepperNext>Avançar</button>
          </div>
        </mat-step>

        <mat-step label="Especialidade e UE" [completed]="!!especialidade() && !!ueSelecionada()">
          <label class="campo">
            <span>Especialidade</span>
            <select [(ngModel)]="especialidadeValor">
              <option value="">Selecione</option>
              @for (e of especialidades; track e) {
                <option [value]="e">{{ e }}</option>
              }
            </select>
          </label>
          <label class="campo">
            <span>Unidade Executante</span>
            <select [(ngModel)]="ueValor">
              <option value="">Selecione</option>
              @for (u of unidades; track u.id) {
                <option [value]="u.id">{{ u.nome }} · {{ u.municipioNome }}</option>
              }
            </select>
          </label>
          <div class="passo-acoes">
            <button class="btn-secondary" matStepperPrevious>Voltar</button>
            <button class="btn-primary" [disabled]="!especialidade() || !ueSelecionada()" matStepperNext>Avançar</button>
          </div>
        </mat-step>

        <mat-step label="Agenda">
          <label class="campo">
            <span>Data</span>
            <input type="date" [(ngModel)]="data" />
          </label>
          <label class="campo">
            <span>Horário</span>
            <select [(ngModel)]="hora">
              <option value="">Selecione</option>
              @for (h of horarios; track h) {
                <option [value]="h">{{ h }}</option>
              }
            </select>
          </label>
          <div class="passo-acoes">
            <button class="btn-secondary" matStepperPrevious>Voltar</button>
            <button class="btn-primary" [disabled]="!data() || !hora()" matStepperNext>Avançar</button>
          </div>
        </mat-step>

        <mat-step label="Resumo">
          <div class="resumo-final">
            <div class="resumo-final__linha"><span>Paciente</span><strong>{{ pacienteSelecionado()?.nome }}</strong></div>
            <div class="resumo-final__linha"><span>Especialidade</span><strong>{{ especialidade() }}</strong></div>
            <div class="resumo-final__linha"><span>Unidade</span><strong>{{ ueSelecionada()?.nome }}</strong></div>
            <div class="resumo-final__linha"><span>Data / Horário</span><strong>{{ data() }} · {{ hora() }}</strong></div>
          </div>
          <div class="passo-acoes">
            <button class="btn-secondary" matStepperPrevious>Voltar</button>
            <button class="btn-primary" (click)="confirmar()">
              <span class="material-icons-round">check_circle</span>
              Confirmar agendamento
            </button>
          </div>
        </mat-step>
      </mat-stepper>
    </div>
  `,
  styleUrl: './marcar-consulta-dialog.scss',
})
export class MarcarConsultaDialog {
  ref = signal<MatDialogRef<MarcarConsultaDialog> | null>(null);

  especialidades = ESPECIALIDADES_MOCK;
  unidades = UES_MOCK.slice(0, 40);
  horarios = ['07:00', '07:20', '08:00', '09:00', '10:00', '13:00', '14:00', '15:00', '16:00'];

  termoPaciente = '';
  pacienteSelecionado = signal<Paciente | undefined>(undefined);

  especialidadeValor = '';
  ueValor = '';
  data = signal('');
  hora = signal('');

  pacientesFiltrados = computed(() => {
    const termo = this.termoPacienteSignal().toLowerCase();
    if (!termo) return PACIENTES_MOCK.slice(0, 6);
    return PACIENTES_MOCK.filter((p) => p.nome.toLowerCase().includes(termo)).slice(0, 8);
  });

  private termoPacienteSignal = signal('');

  especialidade = computed(() => this.especialidadeValor);
  ueSelecionada = computed<UnidadeExecutante | undefined>(() =>
    this.unidades.find((u) => u.id === this.ueValor),
  );

  constructor(dialogRef: MatDialogRef<MarcarConsultaDialog>) {
    this.ref.set(dialogRef);
  }

  ngDoCheck(): void {
    this.termoPacienteSignal.set(this.termoPaciente);
  }

  confirmar(): void {
    this.ref()?.close({
      pacienteId: this.pacienteSelecionado()?.id,
      pacienteNome: this.pacienteSelecionado()?.nome,
      especialidade: this.especialidade(),
      ueId: this.ueSelecionada()?.id,
      ueNome: this.ueSelecionada()?.nome,
      municipioNome: this.ueSelecionada()?.municipioNome,
      data: this.data(),
      hora: this.hora(),
    });
  }
}
