import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-loading-skeleton',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (variante() === 'card') {
      <div class="skel-grid">
        @for (i of contador(); track i) {
          <div class="skel skel-card"></div>
        }
      </div>
    } @else if (variante() === 'linha') {
      <div class="skel-lines">
        @for (i of contador(); track i) {
          <div class="skel skel-line"></div>
        }
      </div>
    } @else {
      <div class="skel skel-block" [style.height.px]="altura()"></div>
    }
  `,
  styleUrl: './loading-skeleton.scss',
})
export class LoadingSkeleton {
  variante = input<'card' | 'linha' | 'bloco'>('bloco');
  quantidade = input<number>(4);
  altura = input<number>(220);

  contador(): number[] {
    return Array.from({ length: this.quantidade() }, (_, i) => i);
  }
}
