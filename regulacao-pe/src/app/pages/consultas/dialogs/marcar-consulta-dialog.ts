import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { PACIENTES_MOCK, ESPECIALIDADES_MOCK, UES_MOCK } from '../../../mock';
import { Paciente, UnidadeExecutante } from '../../../models';

const ETAPAS = ['Paciente', 'Especialidade e UE', 'Agenda', 'Resumo'] as const;

@Component({
  selector: 'app-marcar-consulta-dialog',
  standalone: true,
  imports: [FormsModule, MatDialogModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 mat-dialog-title>Marcar consulta</h2>

    <div class="stepper-trilha">
      @for (etapa of etapas; track etapa; let i = $index) {
        <div class="stepper-trilha__item" [class.stepper-trilha__item--ativo]="i === passo()" [class.stepper-trilha__item--concluido]="i < passo()">
          <span class="stepper-trilha__bola">
            @if (i < passo()) {
              <span class="material-icons-round">check</span>
            } @else {
              {{ i + 1 }}
            }
          </span>
          <span class="stepper-trilha__label">{{ etapa }}</span>
        </div>
        @if (i < etapas.length - 1) { <span class="stepper-trilha__linha"></span> }
      }
    </div>

    <div mat-dialog-content class="conteudo">
      @if (passo() === 0) {
        <label class="campo">
          <span>Buscar paciente</span>
          <input type="text" [(ngModel)]="termoPaciente" (ngModelChange)="termoPacienteSignal.set($event)" placeholder="Nome do paciente..." />
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
      }

      @if (passo() === 1) {
        <label class="campo">
          <span>Especialidade</span>
          <select [(ngModel)]="especialidadeValor">
            <option value="">Selecione</option>
            @for (e of especialidades; track e) { <option [value]="e">{{ e }}</option> }
          </select>
        </label>
        <label class="campo">
          <span>Unidade Executante</span>
          <select [(ngModel)]="ueValor">
            <option value="">Selecione</option>
            @for (u of unidades; track u.id) { <option [value]="u.id">{{ u.nome }} · {{ u.municipioNome }}</option> }
          </select>
        </label>
      }

      @if (passo() === 2) {
        <label class="campo">
          <span>Data</span>
          <input type="date" [(ngModel)]="dataValor" />
        </label>
        <label class="campo">
          <span>Horário</span>
          <select [(ngModel)]="horaValor">
            <option value="">Selecione</option>
            @for (h of horarios; track h) { <option [value]="h">{{ h }}</option> }
          </select>
        </label>
      }

      @if (passo() === 3) {
        <div class="resumo-final">
          <div class="resumo-final__linha"><span>Paciente</span><strong>{{ pacienteSelecionado()?.nome }}</strong></div>
          <div class="resumo-final__linha"><span>Especialidade</span><strong>{{ especialidadeValor }}</strong></div>
          <div class="resumo-final__linha"><span>Unidade</span><strong>{{ ueSelecionada()?.nome }}</strong></div>
          <div class="resumo-final__linha"><span>Data / Horário</span><strong>{{ dataValor }} · {{ horaValor }}</strong></div>
        </div>
      }
    </div>

    <div mat-dialog-actions class="acoes">
      @if (passo() > 0) {
        <button class="btn-secondary" (click)="voltar()">Voltar</button>
      } @else {
        <button class="btn-secondary" (click)="ref.close(null)">Cancelar</button>
      }

      @if (passo() < 3) {
        <button class="btn-primary" [disabled]="!podeAvancar()" (click)="avancar()">Avançar</button>
      } @else {
        <button class="btn-primary" (click)="confirmar()">
          <span class="material-icons-round">check_circle</span>
          Confirmar agendamento
        </button>
      }
    </div>
  `,
  styleUrl: './marcar-consulta-dialog.scss',
})
export class MarcarConsultaDialog {
  ref = inject(MatDialogRef<MarcarConsultaDialog>);

  etapas = ETAPAS;
  passo = signal(0);

  especialidades = ESPECIALIDADES_MOCK;
  unidades = UES_MOCK.slice(0, 40);
  horarios = ['07:00', '07:20', '08:00', '09:00', '10:00', '13:00', '14:00', '15:00', '16:00'];

  termoPaciente = '';
  termoPacienteSignal = signal('');
  pacienteSelecionado = signal<Paciente | undefined>(undefined);

  especialidadeValor = '';
  ueValor = '';
  dataValor = '';
  horaValor = '';

  pacientesFiltrados = computed(() => {
    const termo = this.termoPacienteSignal().toLowerCase();
    if (!termo) return PACIENTES_MOCK.slice(0, 6);
    return PACIENTES_MOCK.filter((p) => p.nome.toLowerCase().includes(termo)).slice(0, 8);
  });

  ueSelecionada = computed<UnidadeExecutante | undefined>(() =>
    this.unidades.find((u) => u.id === this.ueValor),
  );

  podeAvancar(): boolean {
    if (this.passo() === 0) return !!this.pacienteSelecionado();
    if (this.passo() === 1) return !!this.especialidadeValor && !!this.ueValor;
    if (this.passo() === 2) return !!this.dataValor && !!this.horaValor;
    return true;
  }

  avancar(): void {
    if (this.podeAvancar() && this.passo() < 3) this.passo.update((p) => p + 1);
  }

  voltar(): void {
    if (this.passo() > 0) this.passo.update((p) => p - 1);
  }

  confirmar(): void {
    this.ref.close({
      pacienteId: this.pacienteSelecionado()?.id,
      pacienteNome: this.pacienteSelecionado()?.nome,
      especialidade: this.especialidadeValor,
      ueId: this.ueSelecionada()?.id,
      ueNome: this.ueSelecionada()?.nome,
      municipioNome: this.ueSelecionada()?.municipioNome,
      data: this.dataValor,
      hora: this.horaValor,
    });
  }
}
