import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MenuItem } from '../../../models';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <aside class="sidebar" [class.sidebar--collapsed]="colapsada()">
      <div class="sidebar__brand">
        <div class="sidebar__logo">
          <span class="material-icons-round">health_and_safety</span>
        </div>
        @if (!colapsada()) {
          <div class="sidebar__brand-text">
            <strong>SIRA-PE</strong>
            <small>Regulação Ambulatorial</small>
          </div>
        }
      </div>

      <nav class="sidebar__nav">
        @for (item of itens(); track item.route) {
          <a
            class="sidebar__item"
            [routerLink]="item.route"
            routerLinkActive="sidebar__item--active"
            [title]="item.label"
          >
            <span class="material-icons-round">{{ item.icon }}</span>
            @if (!colapsada()) {
              <span class="sidebar__item-label">{{ item.label }}</span>
            }
          </a>
        }
      </nav>

      <button class="sidebar__toggle" (click)="alternarColapso.emit()">
        <span class="material-icons-round">{{ colapsada() ? 'chevron_right' : 'chevron_left' }}</span>
      </button>
    </aside>
  `,
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  itens = input.required<MenuItem[]>();
  colapsada = input<boolean>(false);
  alternarColapso = output<void>();
}
