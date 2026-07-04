import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Breadcrumb } from '../../shared/components/breadcrumb/breadcrumb';
import { KpiCard } from '../../shared/components/kpi-card/kpi-card';
import { StatusBadge } from '../../shared/components/status-badge/status-badge';
import { LoadingSkeleton } from '../../shared/components/loading-skeleton/loading-skeleton';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { UeService } from '../../services/ue.service';
import { AgendaService } from '../../services/agenda.service';
import { EscopoService } from '../../core/services/escopo.service';
import { PROFISSIONAIS_MOCK } from '../../mock';
import { UnidadeExecutante, Agenda, Profissional } from '../../models';

@Component({
  selector: 'app-unidade-detalhe',
  standalone: true,
  imports: [RouterLink, Breadcrumb, KpiCard, StatusBadge, LoadingSkeleton, EmptyState],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="sira-page sira-fade-in">
      @if (carregando()) {
        <app-loading-skeleton variante="card" [quantidade]="4" />
      } @else if (!ue()) {
        <app-empty-state icon="local_hospital" titulo="Unidade não encontrada" />
      } @else {
        @if (!ehMinhaUnidade()) {
          <app-breadcrumb
            [itens]="[{ label: 'Dashboard', route: '/home' }, { label: 'Unidades Executantes', route: '/unidades' }, { label: ue()!.nome }]"
          />
        } @else {
          <app-breadcrumb [itens]="[{ label: 'Dashboard', route: '/home' }, { label: 'Minha Unidade' }]" />
        }

        <div class="sira-page-header">
          <div class="sira-page-header__title">
            <span class="sira-eyebrow">CNES {{ ue()!.cnes }} · {{ ue()!.geresNome }}</span>
            <h1>{{ ue()!.nome }}</h1>
            <p>{{ ue()!.endereco }} · {{ ue()!.telefone }} · Responsável: {{ ue()!.responsavelNome }}</p>
          </div>
          <div style="display:flex; gap:8px; align-items:center">
            <app-status-badge [status]="ue()!.nivelRegulacao" />
            <app-status-badge [status]="ue()!.status" />
          </div>
        </div>

        @if (ehMinhaUnidade()) {
          <div class="sira-card panel" style="margin-bottom:20px; display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap">
            <div>
              <h3 style="margin-bottom:2px">Enviar nova agenda</h3>
              <p style="margin:0">Envie a agenda de atendimentos da sua unidade para validação.</p>
            </div>
            <a class="btn-primary" routerLink="/enviar-agenda">
              <span class="material-icons-round">upload_file</span>
              Enviar Agenda
            </a>
          </div>
        }

        <div class="sira-grid sira-grid--kpi" style="margin-bottom:20px">
          <app-kpi-card label="Profissionais" [value]="ue()!.profissionaisQtd + ''" icon="groups" tone="primary" />
          <app-kpi-card label="Vagas disponíveis" [value]="ue()!.vagasDisponiveis + ''" icon="event_seat" tone="sus" />
          <app-kpi-card label="Vagas totais" [value]="ue()!.vagasTotais + ''" icon="grid_view" tone="neutral" />
          <app-kpi-card label="Especialidades" [value]="ue()!.especialidades.length + ''" icon="medical_services" tone="pending" />
        </div>

        <div class="sira-card panel" style="margin-bottom:20px">
          <h3>Especialidades atendidas</h3>
          <div class="chips">
            @for (e of ue()!.especialidades; track e) {
              <span class="chip">{{ e }}</span>
            }
          </div>
        </div>

        <div class="sira-grid sira-grid--2">
          <div class="sira-card panel">
            <h3>Agendas enviadas</h3>
            @if (agendas().length === 0) {
              <app-empty-state icon="event_busy" titulo="Nenhuma agenda enviada" />
            } @else {
              <div class="lista-simples">
                @for (a of agendas(); track a.id) {
                  <div class="lista-simples__item">
                    <div>
                      <strong>{{ a.especialidade }} · {{ a.profissionalNome }}</strong>
                      <span>{{ a.periodo }} · {{ a.vagasDisponiveis }}/{{ a.vagasTotais }} vagas</span>
                    </div>
                    <app-status-badge [status]="a.status" />
                  </div>
                }
              </div>
            }
          </div>

          <div class="sira-card panel">
            <h3>Profissionais</h3>
            <div class="lista-simples">
              @for (p of profissionais(); track p.id) {
                <div class="lista-simples__item">
                  <div>
                    <strong>{{ p.nome }}</strong>
                    <span>{{ p.especialidade }} · {{ p.cargaHorariaSemanal }}h/semana</span>
                  </div>
                  <app-status-badge [status]="p.status" />
                </div>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styleUrl: './unidade-detalhe.scss',
})
export class UnidadeDetalhe {
  ue = signal<UnidadeExecutante | undefined>(undefined);
  agendas = signal<Agenda[]>([]);
  profissionais = signal<Profissional[]>([]);
  carregando = signal(true);
  ehMinhaUnidade = signal(false);

  constructor(
    route: ActivatedRoute,
    ueService: UeService,
    agendaService: AgendaService,
    escopo: EscopoService,
  ) {
    const idDaRota = route.snapshot.paramMap.get('id');
    const id = idDaRota ?? escopo.vinculoId() ?? '';
    this.ehMinhaUnidade.set(!idDaRota);

    ueService.obterPorId(id).subscribe((u) => {
      this.ue.set(u);
      this.carregando.set(false);
      this.profissionais.set(PROFISSIONAIS_MOCK.filter((p) => p.ueId === id));
    });

    agendaService.listarPorUe(id).subscribe((a) => this.agendas.set(a));
  }
}
