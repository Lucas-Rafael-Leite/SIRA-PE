import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Breadcrumb } from '../../../shared/components/breadcrumb/breadcrumb';
import { DashboardConfigService } from './dashboard-config.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-gerenciar-dashboards',
  standalone: true,
  imports: [Breadcrumb],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="sira-page sira-fade-in">
      <app-breadcrumb [itens]="[{ label: 'Dashboard', route: '/home' }, { label: 'Gerenciar Dashboards' }]" />

      <div class="sira-page-header">
        <div class="sira-page-header__title">
          <span class="sira-eyebrow">Configuração de painéis</span>
          <h1>Gerenciar Dashboards</h1>
          <p>Escolha quais painéis aparecem no Dashboard geral (Home) de todos os perfis.</p>
        </div>
      </div>

      <div class="sira-card panel">
        @for (w of config.listar()(); track w.id) {
          <label class="widget-item">
            <div>
              <strong>{{ w.nome }}</strong>
              <span>{{ w.descricao }}</span>
            </div>
            <input type="checkbox" [checked]="w.visivel" (change)="alternar(w.id)" />
          </label>
        }
      </div>
    </div>
  `,
  styleUrl: './gerenciar-dashboards.scss',
})
export class GerenciarDashboards {
  constructor(
    public config: DashboardConfigService,
    private notify: NotificationService,
  ) {}

  alternar(id: string): void {
    this.config.alternar(id);
    this.notify.info('Configuração de dashboard atualizada.');
  }
}
