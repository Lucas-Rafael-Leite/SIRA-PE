import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgClass } from '@angular/common';

export type KpiTendencia = 'alta' | 'baixa' | 'estavel';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="kpi-card sira-fade-in" [ngClass]="'kpi-card--' + tone()">
      <div class="kpi-card__icon">
        <span class="material-icons-round">{{ icon() }}</span>
      </div>
      <div class="kpi-card__body">
        <span class="kpi-card__label">{{ label() }}</span>
        <strong class="kpi-card__value">{{ value() }}</strong>
        @if (trendLabel()) {
          <span class="kpi-card__trend" [ngClass]="'kpi-card__trend--' + trend()">
            <span class="material-icons-round">{{ trendIcon() }}</span>
            {{ trendLabel() }}
          </span>
        }
      </div>
    </div>
  `,
  styleUrl: './kpi-card.scss',
})
export class KpiCard {
  label = input.required<string>();
  value = input.required<string>();
  icon = input<string>('insights');
  tone = input<'primary' | 'sus' | 'alert' | 'pending' | 'neutral'>('primary');
  trend = input<KpiTendencia>('estavel');
  trendLabel = input<string>('');

  trendIcon(): string {
    switch (this.trend()) {
      case 'alta': return 'trending_up';
      case 'baixa': return 'trending_down';
      default: return 'trending_flat';
    }
  }
}
