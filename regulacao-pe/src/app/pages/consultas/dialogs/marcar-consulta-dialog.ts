import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { VagaService } from '../../../services/vaga.service';
import { PacienteService } from '../../../services/paciente.service';
import { NotificationService } from '../../../services/notification.service';
import { AuthService } from '../../../core/services/auth.service';
import { EscopoService } from '../../../core/services/escopo.service';
import { Paciente, Vaga } from '../../../models';

export interface MarcarConsultaDialogData {
  vagaPreSelecionada?: Vaga;
}

type Fase = 'vaga' | 'paciente' | 'cmce-form' | 'cmce-confirmacao' | 'aguardando-municipio' | 'resumo';

@Component({
  selector: 'app-marcar-consulta-dialog',
  standalone: true,
  imports: [FormsModule, MatDialogModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 mat-dialog-title>Marcar consulta</h2>

    <div class="stepper-trilha">
      @for (f of fasesVisiveis(); track f; let i = $index) {
        <div class="stepper-trilha__item" [class.stepper-trilha__item--ativo]="f === fase()" [class.stepper-trilha__item--concluido]="indiceFase() > i">
          <span class="stepper-trilha__bola">
            @if (indiceFase() > i) { <span class="material-icons-round">check</span> } @else { {{ i + 1 }} }
          </span>
          <span class="stepper-trilha__label">{{ rotuloFase(f) }}</span>
        </div>
        @if (i < fasesVisiveis().length - 1) { <span class="stepper-trilha__linha"></span> }
      }
    </div>

    <div mat-dialog-content class="conteudo">
      <!-- ===== Escolher vaga ===== -->
      @if (fase() === 'vaga') {
        <p class="instrucao">Selecione uma vaga disponível dentro do seu escopo de atuação.</p>
        <label class="campo">
          <span>Buscar por especialidade ou unidade</span>
          <input type="text" [(ngModel)]="termoVaga" (ngModelChange)="termoVagaSignal.set($event)" placeholder="Ex: Cardiologia, Hospital..." />
        </label>
        <div class="lista-selecao">
          @if (vagasDisponiveisFiltradas().length === 0) {
            <p class="vazio">Nenhuma vaga disponível encontrada no seu escopo.</p>
          }
          @for (v of vagasDisponiveisFiltradas(); track v.id) {
            <button
              class="item-selecao"
              [class.item-selecao--ativo]="vagaSelecionada()?.id === v.id"
              (click)="vagaSelecionada.set(v)"
            >
              <strong>{{ v.especialidade }} · {{ v.ueNome }}</strong>
              <span>{{ v.municipioNome }} · {{ v.data }} {{ v.hora }} · {{ v.profissionalNome }}</span>
            </button>
          }
        </div>
      }

      <!-- ===== Escolher paciente ===== -->
      @if (fase() === 'paciente') {
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

      <!-- ===== Preenchimento no CMCE (todos exceto UE) ===== -->
      @if (fase() === 'cmce-form') {
        <p class="instrucao">
          O sistema irá se comunicar com o CMCE para efetivar a marcação. Confira os dados abaixo.
        </p>
        <div class="resumo-final">
          <div class="resumo-final__linha"><span>Paciente</span><strong>{{ pacienteSelecionado()?.nome }}</strong></div>
          <div class="resumo-final__linha"><span>Cartão SUS</span><strong>{{ pacienteSelecionado()?.cartaoSus }}</strong></div>
          <div class="resumo-final__linha"><span>Procedimento</span><strong>{{ vagaSelecionada()?.especialidade }}</strong></div>
          <div class="resumo-final__linha"><span>Unidade</span><strong>{{ vagaSelecionada()?.ueNome }}</strong></div>
          <div class="resumo-final__linha"><span>Data / Horário</span><strong>{{ vagaSelecionada()?.data }} · {{ vagaSelecionada()?.hora }}</strong></div>
        </div>
        <button class="btn-secondary" style="margin-top:14px" (click)="exportarModeloCmce()">
          <span class="material-icons-round">download</span>
          Exportar modelo para preenchimento manual no CMCE
        </button>
      }

      <!-- ===== Confirmação no CMCE ===== -->
      @if (fase() === 'cmce-confirmacao') {
        <div class="cmce-aviso">
          <span class="material-icons-round">sync</span>
          Aguardando confirmação de que o status da vaga foi atualizado no CMCE.
        </div>
        <label class="switch-item">
          <input type="checkbox" [(ngModel)]="confirmadoNoCmce" />
          <span>Confirmo que a marcação foi registrada e o status da vaga foi atualizado no CMCE</span>
        </label>
      }

      <!-- ===== UE: aguardando marcação pelo município ===== -->
      @if (fase() === 'aguardando-municipio') {
        <div class="cmce-aviso">
          <span class="material-icons-round">hourglass_top</span>
          Como Unidade Executante, a marcação final no CMCE é feita pelo município. Uma notificação
          foi enviada para {{ vagaSelecionada()?.municipioNome }} solicitando a marcação desta vaga.
        </div>
        <p class="instrucao" style="margin-top:12px">
          Para fins de demonstração deste protótipo, use o botão abaixo para simular a confirmação
          da marcação pelo município.
        </p>
        <button class="btn-secondary" (click)="simularMarcacaoMunicipio()">
          <span class="material-icons-round">how_to_reg</span>
          Simular marcação pelo município
        </button>
        @if (municipioSimulou()) {
          <div class="validacao-ok" style="margin-top:12px">
            <span class="material-icons-round">check_circle</span>
            O município confirmou a marcação. Você já pode avançar.
          </div>
        }
      }

      <!-- ===== Resumo final ===== -->
      @if (fase() === 'resumo') {
        <div class="resumo-final">
          <div class="resumo-final__linha"><span>Paciente</span><strong>{{ pacienteSelecionado()?.nome }}</strong></div>
          <div class="resumo-final__linha"><span>Especialidade</span><strong>{{ vagaSelecionada()?.especialidade }}</strong></div>
          <div class="resumo-final__linha"><span>Unidade</span><strong>{{ vagaSelecionada()?.ueNome }}</strong></div>
          <div class="resumo-final__linha"><span>Data / Horário</span><strong>{{ vagaSelecionada()?.data }} · {{ vagaSelecionada()?.hora }}</strong></div>
        </div>
      }
    </div>

    <div mat-dialog-actions class="acoes">
      @if (fase() !== 'vaga' || data.vagaPreSelecionada) {
        <button class="btn-secondary" (click)="voltar()">Voltar</button>
      } @else {
        <button class="btn-secondary" (click)="ref.close(null)">Cancelar</button>
      }

      @if (fase() !== 'resumo') {
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
  data = inject<MarcarConsultaDialogData>(MAT_DIALOG_DATA, { optional: true }) ?? {};

  private vagaService = inject(VagaService);
  private pacienteService = inject(PacienteService);
  private notify = inject(NotificationService);
  private auth = inject(AuthService);
  private escopo = inject(EscopoService);

  ehUe = computed(() => this.auth.perfil() === 'UnidadeExecutante');

  fase = signal<Fase>('vaga');
  confirmadoNoCmce = signal(false);
  municipioSimulou = signal(false);

  termoVaga = '';
  termoVagaSignal = signal('');
  vagaSelecionada = signal<Vaga | undefined>(this.data.vagaPreSelecionada);

  termoPaciente = '';
  termoPacienteSignal = signal('');
  pacienteSelecionado = signal<Paciente | undefined>(undefined);

  vagasDisponiveisFiltradas = computed(() => {
    const termo = this.termoVagaSignal().toLowerCase();
    const todasNoEscopo = this.escopo.filtrarPorHierarquia(
      this.listaVagasBase().filter((v) => v.status === 'disponivel'),
    );
    if (!termo) return todasNoEscopo.slice(0, 30);
    return todasNoEscopo
      .filter((v) => v.especialidade.toLowerCase().includes(termo) || v.ueNome.toLowerCase().includes(termo))
      .slice(0, 30);
  });

  pacientesFiltrados = computed(() => this.pacienteService.buscar(this.termoPacienteSignal()));

  private listaVagasBaseCache: Vaga[] = [];
  listaVagasBase(): Vaga[] {
    return this.listaVagasBaseCache;
  }

  constructor() {
    this.vagaService.listar().subscribe((v) => (this.listaVagasBaseCache = v));
    if (this.data.vagaPreSelecionada) {
      this.fase.set('paciente');
    }
  }

  fasesVisiveis = computed<Fase[]>(() => {
    if (this.ehUe()) return ['vaga', 'paciente', 'aguardando-municipio', 'resumo'];
    return ['vaga', 'paciente', 'cmce-form', 'cmce-confirmacao', 'resumo'];
  });

  indiceFase = computed(() => this.fasesVisiveis().indexOf(this.fase()));

  rotuloFase(f: Fase): string {
    const mapa: Record<Fase, string> = {
      vaga: 'Vaga',
      paciente: 'Paciente',
      'cmce-form': 'Preenchimento CMCE',
      'cmce-confirmacao': 'Confirmação CMCE',
      'aguardando-municipio': 'Aguardando município',
      resumo: 'Resumo',
    };
    return mapa[f];
  }

  podeAvancar(): boolean {
    if (this.fase() === 'vaga') return !!this.vagaSelecionada();
    if (this.fase() === 'paciente') return !!this.pacienteSelecionado();
    if (this.fase() === 'cmce-confirmacao') return this.confirmadoNoCmce();
    if (this.fase() === 'aguardando-municipio') return this.municipioSimulou();
    return true;
  }

  avancar(): void {
    if (!this.podeAvancar()) return;
    const ordem = this.fasesVisiveis();
    const idx = ordem.indexOf(this.fase());
    if (idx < ordem.length - 1) this.fase.set(ordem[idx + 1]);
  }

  voltar(): void {
    const ordem = this.fasesVisiveis();
    const idx = ordem.indexOf(this.fase());
    if (idx > 0) this.fase.set(ordem[idx - 1]);
  }

  exportarModeloCmce(): void {
    this.notify.info('Modelo de marcação exportado para preenchimento manual no CMCE.');
  }

  simularMarcacaoMunicipio(): void {
    this.municipioSimulou.set(true);
    this.notify.info('Notificação de marcação enviada — município confirmou (simulado).');
  }

  confirmar(): void {
    const vaga = this.vagaSelecionada();
    const paciente = this.pacienteSelecionado();
    if (!vaga || !paciente) return;

    this.ref.close({
      vagaId: vaga.id,
      pacienteId: paciente.id,
      pacienteNome: paciente.nome,
      especialidade: vaga.especialidade,
      ueId: vaga.ueId,
      ueNome: vaga.ueNome,
      municipioNome: vaga.municipioNome,
      profissionalNome: vaga.profissionalNome,
      data: vaga.data,
      hora: vaga.hora,
    });
  }
}
