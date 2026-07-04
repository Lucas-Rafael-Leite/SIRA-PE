import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Breadcrumb } from '../../../shared/components/breadcrumb/breadcrumb';
import { NotificationService } from '../../../services/notification.service';

interface RegistroCmce {
  ue: string;
  campo: string;
  valorAtual: string;
  valorNovo: string;
}

@Component({
  selector: 'app-cmce-import',
  standalone: true,
  imports: [Breadcrumb],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="sira-page sira-fade-in">
      <app-breadcrumb [itens]="[{ label: 'Dashboard', route: '/home' }, { label: 'Dados do CMCE' }]" />

      <div class="sira-page-header">
        <div class="sira-page-header__title">
          <span class="sira-eyebrow">Integração de dados</span>
          <h1>Inserir dados do CMCE</h1>
          <p>Importe o arquivo de atualização do Cadastro Municipal de Estabelecimentos de Saúde para atualizar o painel.</p>
        </div>
      </div>

      <div class="sira-card panel">
        @if (!arquivoNome()) {
          <div class="upload-area" (click)="simularUpload()">
            <span class="material-icons-round">cloud_upload</span>
            <strong>Clique para selecionar o arquivo do CMCE</strong>
            <span>Formatos aceitos (simulado): .csv, .xml</span>
          </div>
        } @else {
          <div class="arquivo-info">
            <span class="material-icons-round">description</span>
            <div>
              <strong>{{ arquivoNome() }}</strong>
              <span>{{ registros().length }} registro(s) identificados para atualização</span>
            </div>
            <button class="link-btn" (click)="reiniciar()">Remover</button>
          </div>

          <div class="preview-tabela">
            <table>
              <thead><tr><th>Unidade</th><th>Campo</th><th>Valor atual</th><th>Novo valor</th></tr></thead>
              <tbody>
                @for (r of registros(); track r.campo + r.ue) {
                  <tr>
                    <td>{{ r.ue }}</td>
                    <td>{{ r.campo }}</td>
                    <td class="valor-atual">{{ r.valorAtual }}</td>
                    <td class="valor-novo">{{ r.valorNovo }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <div class="passo-acoes">
            <button class="btn-secondary" (click)="reiniciar()">Cancelar</button>
            <button class="btn-primary" (click)="confirmarAtualizacao()">
              <span class="material-icons-round">sync</span>
              Confirmar atualização do painel
            </button>
          </div>
        }
      </div>
    </div>
  `,
  styleUrl: './cmce-import.scss',
})
export class CmceImport {
  arquivoNome = signal('');
  registros = signal<RegistroCmce[]>([]);

  constructor(private notify: NotificationService) {}

  simularUpload(): void {
    this.arquivoNome.set('cmce_pernambuco_junho2026.csv');
    this.registros.set([
      { ue: 'Hospital Regional Caruaru', campo: 'Nº de leitos', valorAtual: '48', valorNovo: '52' },
      { ue: 'Policlínica Garanhuns', campo: 'Especialidades', valorAtual: '6', valorNovo: '7' },
      { ue: 'UPA Petrolina', campo: 'Status', valorAtual: 'Manutenção', valorNovo: 'Ativa' },
      { ue: 'Centro de Especialidades Recife', campo: 'Profissionais', valorAtual: '18', valorNovo: '21' },
    ]);
  }

  reiniciar(): void {
    this.arquivoNome.set('');
    this.registros.set([]);
  }

  confirmarAtualizacao(): void {
    this.notify.sucesso('Dados do CMCE importados. O painel foi atualizado com sucesso.');
    this.reiniciar();
  }
}
