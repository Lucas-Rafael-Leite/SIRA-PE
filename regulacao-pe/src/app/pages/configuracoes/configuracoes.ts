import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Breadcrumb } from '../../shared/components/breadcrumb/breadcrumb';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-configuracoes',
  standalone: true,
  imports: [FormsModule, Breadcrumb],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="sira-page sira-fade-in">
      <app-breadcrumb [itens]="[{ label: 'Dashboard', route: '/home' }, { label: 'Configurações' }]" />

      <div class="sira-page-header">
        <div class="sira-page-header__title">
          <span class="sira-eyebrow">Preferências</span>
          <h1>Configurações</h1>
          <p>Personalize sua experiência no SIRA-PE.</p>
        </div>
      </div>

      <div class="sira-grid sira-grid--2">
        <div class="sira-card config-panel">
          <h3>Perfil</h3>
          <div class="perfil-resumo">
            <div class="perfil-resumo__avatar">{{ auth.usuario()?.avatarIniciais }}</div>
            <div>
              <strong>{{ auth.usuario()?.nome }}</strong>
              <span>{{ auth.usuario()?.email }}</span>
              <span>{{ auth.usuario()?.vinculoNome }}</span>
            </div>
          </div>
          <button class="btn-secondary" (click)="auth.sair()">
            <span class="material-icons-round">logout</span>
            Sair do sistema
          </button>
        </div>

        <div class="sira-card config-panel">
          <h3>Tema</h3>
          <p>Escolha entre o tema claro ou escuro para a interface.</p>
          <div class="tema-opcoes">
            <button
              class="tema-opcao"
              [class.tema-opcao--ativo]="theme.tema() === 'light'"
              (click)="selecionarTema('light')"
            >
              <span class="material-icons-round">light_mode</span>
              Claro
            </button>
            <button
              class="tema-opcao"
              [class.tema-opcao--ativo]="theme.tema() === 'dark'"
              (click)="selecionarTema('dark')"
            >
              <span class="material-icons-round">dark_mode</span>
              Escuro
            </button>
          </div>
        </div>

        <div class="sira-card config-panel">
          <h3>Idioma</h3>
          <p>Idioma padrão do sistema.</p>
          <select class="filtro-select" [(ngModel)]="idioma">
            <option value="pt-BR">Português (Brasil)</option>
            <option value="en-US">English (US)</option>
          </select>
        </div>

        <div class="sira-card config-panel">
          <h3>Preferências de notificação</h3>
          <label class="switch-item">
            <input type="checkbox" [(ngModel)]="notifAlertasCriticos" />
            <span>Notificar alertas críticos por e-mail</span>
          </label>
          <label class="switch-item">
            <input type="checkbox" [(ngModel)]="notifResumoSemanal" />
            <span>Enviar resumo semanal de indicadores</span>
          </label>
          <button class="btn-primary" style="margin-top:12px" (click)="salvar()">Salvar preferências</button>
        </div>
      </div>
    </div>
  `,
  styleUrl: './configuracoes.scss',
})
export class Configuracoes {
  idioma = 'pt-BR';
  notifAlertasCriticos = signal(true);
  notifResumoSemanal = signal(false);

  constructor(
    public auth: AuthService,
    public theme: ThemeService,
    private notify: NotificationService,
  ) {}

  selecionarTema(tema: 'light' | 'dark'): void {
    this.theme.definir(tema);
  }

  salvar(): void {
    this.notify.sucesso('Preferências salvas com sucesso.');
  }
}
