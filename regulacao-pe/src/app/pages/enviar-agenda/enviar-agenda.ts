import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Breadcrumb } from '../../shared/components/breadcrumb/breadcrumb';
import { StatusBadge } from '../../shared/components/status-badge/status-badge';
import { NotificationService } from '../../services/notification.service';
import { EscopoService } from '../../core/services/escopo.service';
import { ESPECIALIDADES_MOCK } from '../../mock';

const ETAPAS = ['Upload', 'Preview', 'Validação', 'Resumo'] as const;

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
          <p>Confira os registros identificados no arquivo antes de prosseguir para a validação.</p>
          <div class="preview-tabela">
            <table>
              <thead>
                <tr><th>Especialidade</th><th>Profissional</th><th>Período</th><th>Vagas</th></tr>
              </thead>
              <tbody>
                @for (l of linhas(); track $index) {
                  <tr>
                    <td>{{ l.especialidade }}</td>
                    <td>{{ l.profissional }}</td>
                    <td>{{ l.periodo }}</td>
                    <td>{{ l.vagas }}</td>
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
            <p>Foram identificadas pendências que devem ser corrigidas ou reconhecidas antes do envio:</p>
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
            <div class="resumo-final__linha"><span>Pendências</span><strong>{{ inconsistencias().length }}</strong></div>
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
  linhas = signal<{ especialidade: string; profissional: string; periodo: string; vagas: number }[]>([]);
  inconsistencias = signal<InconsistenciaSimulada[]>([]);

  minhaUeNome = computed(() => this.escopo.minhaUe()?.nome ?? 'Minha Unidade');

  constructor(
    private escopo: EscopoService,
    private notify: NotificationService,
    private router: Router,
  ) {}

  simularUpload(): void {
    const especialidadesUe = this.escopo.minhaUe()?.especialidades ?? ESPECIALIDADES_MOCK.slice(0, 3);
    this.arquivoNome.set(`agenda_julho_2026_${this.escopo.minhaUe()?.id ?? 'ue'}.xlsx`);
    this.linhas.set(
      especialidadesUe.slice(0, 4).map((esp, i) => ({
        especialidade: esp,
        profissional: `Dr(a). Profissional ${i + 1}`,
        periodo: '01/08/2026 a 15/08/2026',
        vagas: 20 + i * 5,
      })),
    );
  }

  validar(): void {
    const inconsistenciasGeradas: InconsistenciaSimulada[] = [];
    if (this.linhas().length > 2) {
      inconsistenciasGeradas.push({
        mensagem: 'Sobreposição de horários detectada entre dois profissionais.',
        severidade: 'aviso',
      });
    }
    if (this.linhas().some((l) => l.vagas > 30)) {
      inconsistenciasGeradas.push({
        mensagem: 'Quantidade de vagas divergente do cadastro no CNES.',
        severidade: 'pendente',
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
    this.notify.sucesso('Agenda enviada com sucesso para validação da regulação.');
    this.router.navigateByUrl('/minha-unidade');
  }
}
