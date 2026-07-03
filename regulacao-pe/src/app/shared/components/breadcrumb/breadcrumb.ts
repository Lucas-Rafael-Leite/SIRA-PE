import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface BreadcrumbItem {
  label: string;
  route?: string;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="breadcrumb" aria-label="breadcrumb">
      @for (item of itens(); track item.label; let last = $last) {
        @if (item.route && !last) {
          <a [routerLink]="item.route">{{ item.label }}</a>
          <span class="material-icons-round breadcrumb__sep">chevron_right</span>
        } @else {
          <span class="breadcrumb__current">{{ item.label }}</span>
        }
      }
    </nav>
  `,
  styleUrl: './breadcrumb.scss',
})
export class Breadcrumb {
  itens = input.required<BreadcrumbItem[]>();
}
