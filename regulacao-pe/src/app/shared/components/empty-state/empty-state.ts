import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="empty-state">
      <span class="material-icons-round">{{ icon() }}</span>
      <h3>{{ titulo() }}</h3>
      <p>{{ descricao() }}</p>
    </div>
  `,
  styleUrl: './empty-state.scss',
})
export class EmptyState {
  icon = input<string>('inbox');
  titulo = input<string>('Nenhum registro encontrado');
  descricao = input<string>('Ajuste os filtros aplicados ou tente novamente.');
}
