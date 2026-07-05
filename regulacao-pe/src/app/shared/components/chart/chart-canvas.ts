import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
  input,
} from '@angular/core';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-chart-canvas',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="chart-canvas" [style.height.px]="altura()"><canvas #canvasRef></canvas></div>`,
  styles: [
    `.chart-canvas { position: relative; width: 100%; display: block; }
     canvas { position: absolute; top: 0; left: 0; width: 100% !important; height: 100% !important; }`,
  ],
})
export class ChartCanvas implements AfterViewInit, OnChanges, OnDestroy {
  config = input.required<ChartConfiguration>();
  altura = input<number>(260);

  @ViewChild('canvasRef') canvasRef!: ElementRef<HTMLCanvasElement>;
  private chart?: Chart;

  ngAfterViewInit(): void {
    this.criar();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['config'] && this.canvasRef) {
      this.chart?.destroy();
      this.criar();
    }
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private criar(): void {
    if (!this.canvasRef) return;
    this.chart = new Chart(this.canvasRef.nativeElement, this.config());
  }
}
