import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Breadcrumb } from '../../shared/components/breadcrumb/breadcrumb';
import { StatusBadge } from '../../shared/components/status-badge/status-badge';
import { NotificationService } from '../../services/notification.service';
import { AgendaService } from '../../services/agenda.service';
import { EscopoService } from '../../core/services/escopo.service';
import { ESPECIALIDADES_MOCK } from '../../mock';
import { Agenda } from '../../models';

const ETAPAS = ['Upload', 'Preview', 'Validação', 'Resumo'] as const;

interface LinhaAgendaEditavel {
  especialidade: string;
  profissional: string;
  periodo: string;
  vagas: number;
}

interface InconsistenciaSimulada {
  mensagem: string;
  severidade: 'aviso' | 'pendente';
}

@Component({
  selector: 'app-enviar-agenda',
  standalone: true,
  imports: [FormsModule, Breadcrumb, StatusBadge],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="sira-page sira-fade-in">
      <app-breadcrumb [itens]="[{ label: 'Dashboard', route: '/home' }, { label: 'Enviar Agenda' }]" />

      <div class="sira-page-header">
        <div class="sira-page-header__title">
          <span class="sira-eyebrow">{{ minhaUeNome() }}</span>
          <h1>Enviar Agenda</h1>
          <p>Envie a agenda de atendimentos da sua unidade para validação da regulação.</p>
        </div>
      </div>

      @if (agendasDevolvidas().length > 0) {
        <div class="sira-card panel devolvidas-panel" style="margin-bottom:20px">
          <div class="panel__header">
            <h3>Agendas devolvidas — aguardando reenvio</h3>
            <span class="sira-eyebrow">{{ agendasDevolvidas().length }} pendente(s)</span>
          </div>
          <div class="lista-devolvidas">
            @for (a of agendasDevolvidas(); track a.id) {
              <div class="devolvida-item">
                <div class="devolvida-item__info">
                  <strong>{{ a.especialidade }} · {{ a.profissionalNome }}</strong>
                  <span>{{ a.periodo }} · {{ a.vagasDisponiveis }}/{{ a.vagasTotais }} vagas</span>
                  <span class="devolvida-item__motivo">Motivo da devolução: {{ a.motivoDevolucao }}</span>
                </div>
                <button class="btn-secondary" (click)="iniciarReenvio(a)">
                  <span class="material-icons-round">replay</span>
                  Reenviar
                </button>
              </div>
            }
          </div>
        </div>
      }

      @if (reenviando()) {
        <div class="sira-card panel" style="margin-bottom:20px">
          <div class="panel__header">
            <h3>Corrigir e reenviar agenda</h3>
            <button class="link-btn" (click)="cancelarReenvio()">Cancelar reenvio</button>
          </div>
          <div class="linha-editavel">
            <label class="campo">
              <span>Profissional</span>
              <input type="text" [(ngModel)]="reenvioProfissional" />
            </label>
            <label class="campo">
              <span>Período</span>
              <input type="text" [(ngModel)]="reenvioPeriodo" />
            </label>
            <label class="campo">
              <span>Vagas totais</span>
              <input type="number" min="1" [(ngModel)]="reenvioVagasTotais" />
            </label>
          </div>
          <div class="passo-acoes">
            <button class="btn-primary" (click)="confirmarReenvio()">
              <span class="material-icons-round">send</span>
              Reenviar agenda corrigida
            </button>
          </div>
        </div>
      }

      <div class="sira-card panel">
        <div class="stepper-trilha">
          @for (etapa of etapas; track etapa; let i = $index) {
            <div class="stepper-trilha__item" [class.stepper-trilha__item--ativo]="i === passo()" [class.stepper-trilha__item--concluido]="i < passo()">
              <span class="stepper-trilha__bola">
                @if (i < passo()) { <span class="material-icons-round">check</span> } @else { {{ i + 1 }} }
              </span>
              <span class="stepper-trilha__label">{{ etapa }}</span>
            </div>
            @if (i < etapas.length - 1) { <span class="stepper-trilha__linha"></span> }
          }
        </div>

        @if (passo() === 0) {
          <div class="upload-area" (click)="simularUpload()">
            <span class="material-icons-round">cloud_upload</span>
            <strong>Clique para selecionar o arquivo de agenda</strong>
            <span>Formatos aceitos (simulado): .xlsx, .csv</span>
          </div>
          @if (arquivoNome()) {
            <div class="arquivo-selecionado">
              <span class="material-icons-round">description</span>
              {{ arquivoNome() }}
              <button class="link-btn" (click)="arquivoNome.set(''); linhas.set([])">Remover</button>
            </div>
          }
          <div class="passo-acoes">
            <button class="btn-primary" [disabled]="!arquivoNome()" (click)="avancar()">Avançar</button>
          </div>
        }

        @if (passo() === 1) {
          <p>Os campos abaixo podem ser editados antes de enviar para validação.</p>
          <div class="preview-tabela">
            <table>
              <thead>
                <tr><th>Especialidade</th><th>Profissional</th><th>Período</th><th>Vagas</th><th></th></tr>
              </thead>
              <tbody>
                @for (l of linhas(); track $index; let i = $index) {
                  <tr>
                    <td>
                      <select [(ngModel)]="l.especialidade">
                        @for (e of especialidades; track e) { <option [value]="e">{{ e }}</option> }
                      </select>
                    </td>
                    <td><input type="text" [(ngModel)]="l.profissional" /></td>
                    <td><input type="text" [(ngModel)]="l.periodo" /></td>
                    <td><input type="number" min="1" [(ngModel)]="l.vagas" style="width:70px" /></td>
                    <td><button class="link-btn" (click)="removerLinha(i)">Remover</button></td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          <div class="passo-acoes">
            <button class="btn-secondary" (click)="voltar()">Voltar</button>
            <button class="btn-primary" (click)="validar()">Validar agenda</button>
          </div>
        }

        @if (passo() === 2) {
          @if (inconsistencias().length === 0) {
            <div class="validacao-ok">
              <span class="material-icons-round">check_circle</span>
              Nenhuma inconsistência encontrada. A agenda está pronta para envio.
            </div>
          } @else {
            <p>Foram identificadas observações que devem ser revisadas antes do envio:</p>
            <div class="lista-inconsistencias">
              @for (inc of inconsistencias(); track inc.mensagem) {
                <div class="inconsistencia-item">
                  <app-status-badge [status]="inc.severidade === 'pendente' ? 'pendente' : 'media'" />
                  <span>{{ inc.mensagem }}</span>
                </div>
              }
            </div>
          }
          <div class="passo-acoes">
            <button class="btn-secondary" (click)="voltar()">Voltar</button>
            <button class="btn-primary" (click)="avancar()">Avançar</button>
          </div>
        }

        @if (passo() === 3) {
          <div class="resumo-final">
            <div class="resumo-final__linha"><span>Unidade</span><strong>{{ minhaUeNome() }}</strong></div>
            <div class="resumo-final__linha"><span>Arquivo</span><strong>{{ arquivoNome() }}</strong></div>
            <div class="resumo-final__linha"><span>Registros</span><strong>{{ linhas().length }} agenda(s)</strong></div>
            <div class="resumo-final__linha"><span>Observações</span><strong>{{ inconsistencias().length }}</strong></div>
          </div>
          <div class="passo-acoes">
            <button class="btn-secondary" (click)="voltar()">Voltar</button>
            <button class="btn-primary" (click)="confirmarEnvio()">
              <span class="material-icons-round">send</span>
              Confirmar envio
            </button>
          </div>
        }
      </div>
    </div>
  `,
  styleUrl: './enviar-agenda.scss',
})
export class EnviarAgenda {
  etapas = ETAPAS;
  passo = signal(0);
  arquivoNome = signal('');
  linhas = signal<LinhaAgendaEditavel[]>([]);
  inconsistencias = signal<InconsistenciaSimulada[]>([]);
  especialidades = ESPECIALIDADES_MOCK;

  todasAgendas = signal<Agenda[]>([]);
  reenviando = signal<Agenda | null>(null);
  reenvioProfissional = '';
  reenvioPeriodo = '';
  reenvioVagasTotais = 0;

  minhaUeNome = computed(() => this.escopo.minhaUe()?.nome ?? 'Minha Unidade');

  agendasDevolvidas = computed(() => {
    const ueId = this.escopo.vinculoId();
    return this.todasAgendas().filter((a) => a.ueId === ueId && a.status === 'devolvida');
  });

  constructor(
    private escopo: EscopoService,
    private notify: NotificationService,
    private agendaService: AgendaService,
    private router: Router,
  ) {
    this.carregarAgendas();
  }

  private carregarAgendas(): void {
    const ueId = this.escopo.vinculoId();
    if (!ueId) return;
    this.agendaService.listarPorUe(ueId).subscribe((a) => this.todasAgendas.set(a));
  }

  simularUpload(): void {
    const especialidadesUe = this.escopo.minhaUe()?.especialidades ?? ESPECIALIDADES_MOCK.slice(0, 3);
    this.arquivoNome.set(`agenda_agosto_2026_${this.escopo.minhaUe()?.id ?? 'ue'}.xlsx`);
    this.linhas.set(
      especialidadesUe.slice(0, 4).map((esp, i) => ({
        especialidade: esp,
        profissional: `Dr(a). Profissional ${i + 1}`,
        periodo: '01/08/2026 a 15/08/2026',
        vagas: 20 + i * 5,
      })),
    );
  }

  removerLinha(i: number): void {
    this.linhas.update((lista) => lista.filter((_, idx) => idx !== i));
  }

  validar(): void {
    const inconsistenciasGeradas: InconsistenciaSimulada[] = [];
    if (this.linhas().length > 2) {
      inconsistenciasGeradas.push({
        mensagem: 'Sobreposição de horários detectada entre dois profissionais.',
        severidade: 'aviso',
      });
    }
    // Verificação simulada de feriado no período informado (substitui a antiga checagem de CNES).
    const periodoAgosto = this.linhas().some((l) => l.periodo.toLowerCase().includes('agosto'));
    if (periodoAgosto) {
      inconsistenciasGeradas.push({
        mensagem: '15 de agosto é feriado municipal em algumas cidades — confirme se a agenda considera esse dia sem atendimento.',
        severidade: 'aviso',
      });
    }
    this.inconsistencias.set(inconsistenciasGeradas);
    this.avancar();
  }

  avancar(): void {
    if (this.passo() < 3) this.passo.update((p) => p + 1);
  }

  voltar(): void {
    if (this.passo() > 0) this.passo.update((p) => p - 1);
  }

  confirmarEnvio(): void {
    const ue = this.escopo.minhaUe();
    if (!ue) return;
    for (const l of this.linhas()) {
      this.agendaService.criar({
        ueId: ue.id,
        ueNome: ue.nome,
        municipioNome: ue.municipioNome,
        geresNome: ue.geresNome,
        responsavelUeNome: ue.responsavelNome,
        especialidade: l.especialidade,
        profissionalNome: l.profissional,
        periodo: l.periodo,
        vagasTotais: l.vagas,
        vagasDisponiveis: l.vagas,
        enviadaPor: ue.nome,
        inconsistencias: this.inconsistencias().map((i) => i.mensagem),
        observacaoFeriado: this.inconsistencias().find((i) => i.mensagem.includes('feriado'))?.mensagem ?? null,
      });
    }
    this.notify.sucesso('Agenda enviada com sucesso para validação da regulação.');
    this.router.navigateByUrl('/minha-unidade');
  }

  iniciarReenvio(agenda: Agenda): void {
    this.reenviando.set(agenda);
    this.reenvioProfissional = agenda.profissionalNome;
    this.reenvioPeriodo = agenda.periodo;
    this.reenvioVagasTotais = agenda.vagasTotais;
  }

  cancelarReenvio(): void {
    this.reenviando.set(null);
  }

  confirmarReenvio(): void {
    const agenda = this.reenviando();
    if (!agenda) return;
    this.agendaService.reenviar(agenda.id, {
      profissionalNome: this.reenvioProfissional,
      periodo: this.reenvioPeriodo,
      vagasTotais: this.reenvioVagasTotais,
      vagasDisponiveis: this.reenvioVagasTotais,
    });
    this.notify.sucesso('Agenda corrigida e reenviada para validação.');
    this.reenviando.set(null);
    this.carregarAgendas();
  }
}
