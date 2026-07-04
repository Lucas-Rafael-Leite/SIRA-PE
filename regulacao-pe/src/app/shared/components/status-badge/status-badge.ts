import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

type StatusTone = 'success' | 'warning' | 'error' | 'info' | 'neutral';

const STATUS_MAP: Record<string, { label: string; tone: StatusTone }> = {
  ativa: { label: 'Ativa', tone: 'success' },
  ativo: { label: 'Ativo', tone: 'success' },
  inativa: { label: 'Inativa', tone: 'neutral' },
  inativo: { label: 'Inativo', tone: 'neutral' },
  manutencao: { label: 'Manutenção', tone: 'warning' },
  afastado: { label: 'Afastado', tone: 'warning' },
  agendada: { label: 'Agendada', tone: 'info' },
  confirmada: { label: 'Confirmada', tone: 'success' },
  realizada: { label: 'Realizada', tone: 'success' },
  cancelada: { label: 'Cancelada', tone: 'error' },
  faltou: { label: 'Faltou', tone: 'warning' },
  disponivel: { label: 'Disponível', tone: 'success' },
  bloqueada: { label: 'Bloqueada', tone: 'error' },
  pendente: { label: 'Pendente', tone: 'warning' },
  validada: { label: 'Validada', tone: 'success' },
  com_inconsistencias: { label: 'Com inconsistências', tone: 'error' },
  publicada: { label: 'Publicada', tone: 'info' },
  baixa: { label: 'Baixa', tone: 'neutral' },
  media: { label: 'Média', tone: 'warning' },
  alta: { label: 'Alta', tone: 'error' },
  critica: { label: 'Crítica', tone: 'error' },
  central: { label: 'Regulação central (GRAMB)', tone: 'info' },
  geres: { label: 'Regulação por GERES', tone: 'neutral' },
};

@Component({
  selector: 'app-status-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="status-badge status-badge--{{ tone() }}">{{ label() }}</span>`,
  styleUrl: './status-badge.scss',
})
export class StatusBadge {
  status = input.required<string>();

  private info = computed(
    () => STATUS_MAP[this.status()] ?? { label: this.status(), tone: 'neutral' as StatusTone },
  );

  label = computed(() => this.info().label);
  tone = computed(() => this.info().tone);
}
