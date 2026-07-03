import { ChangeDetectionStrategy, Component, TemplateRef, computed, input, output, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { StatusBadge } from '../status-badge/status-badge';
import { EmptyState } from '../empty-state/empty-state';
import { LoadingSkeleton } from '../loading-skeleton/loading-skeleton';

export interface ColunaTabela<T> {
  chave: keyof T & string;
  titulo: string;
  tipo?: 'texto' | 'badge' | 'numero' | 'destaque';
  larguraMin?: string;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [NgTemplateOutlet, StatusBadge, EmptyState, LoadingSkeleton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="data-table sira-card">
      @if (carregando()) {
        <div style="padding:20px">
          <app-loading-skeleton variante="linha" [quantidade]="5" />
        </div>
      } @else if (linhasPagina().length === 0) {
        <app-empty-state
          icon="search_off"
          titulo="Nenhum resultado encontrado"
          descricao="Tente ajustar os filtros ou o termo pesquisado."
        />
      } @else {
        <div class="data-table__scroll">
          <table>
            <thead>
              <tr>
                @for (col of colunas(); track col.chave) {
                  <th [style.min-width]="col.larguraMin ?? 'auto'">{{ col.titulo }}</th>
                }
                @if (acoesTemplate()) { <th class="data-table__acoes-th">Ações</th> }
              </tr>
            </thead>
            <tbody>
              @for (linha of linhasPagina(); track $index) {
                <tr (click)="linhaClicada.emit(linha)" [class.clicavel]="!acoesTemplate()">
                  @for (col of colunas(); track col.chave) {
                    <td>
                      @if (col.tipo === 'badge') {
                        <app-status-badge [status]="asString(linha[col.chave])" />
                      } @else if (col.tipo === 'destaque') {
                        <strong>{{ linha[col.chave] }}</strong>
                      } @else {
                        {{ linha[col.chave] }}
                      }
                    </td>
                  }
                  @if (acoesTemplate()) {
                    <td class="data-table__acoes-td" (click)="$event.stopPropagation()">
                      <ng-container
                        [ngTemplateOutlet]="acoesTemplate()!"
                        [ngTemplateOutletContext]="{ $implicit: linha }"
                      ></ng-container>
                    </td>
                  }
                </tr>
              }
            </tbody>
          </table>
        </div>

        <div class="data-table__footer">
          <span>{{ dados().length }} registro(s)</span>
          <div class="data-table__pager">
            <button class="icon-btn" [disabled]="pagina() === 0" (click)="anterior()">
              <span class="material-icons-round">chevron_left</span>
            </button>
            <span>Página {{ pagina() + 1 }} de {{ totalPaginas() }}</span>
            <button class="icon-btn" [disabled]="pagina() >= totalPaginas() - 1" (click)="proxima()">
              <span class="material-icons-round">chevron_right</span>
            </button>
          </div>
        </div>
      }
    </div>
  `,
  styleUrl: './data-table.scss',
})
export class DataTable<T extends Record<string, unknown>> {
  dados = input.required<T[]>();
  colunas = input.required<ColunaTabela<T>[]>();
  carregando = input<boolean>(false);
  acoesTemplate = input<TemplateRef<{ $implicit: T }> | null>(null);
  tamanhoPagina = input<number>(8);

  linhaClicada = output<T>();

  pagina = signal(0);

  totalPaginas = computed(() => Math.max(1, Math.ceil(this.dados().length / this.tamanhoPagina())));

  linhasPagina = computed(() => {
    const inicio = this.pagina() * this.tamanhoPagina();
    return this.dados().slice(inicio, inicio + this.tamanhoPagina());
  });

  asString(valor: unknown): string {
    return String(valor ?? '');
  }

  anterior(): void {
    if (this.pagina() > 0) this.pagina.update((p) => p - 1);
  }

  proxima(): void {
    if (this.pagina() < this.totalPaginas() - 1) this.pagina.update((p) => p + 1);
  }
}
