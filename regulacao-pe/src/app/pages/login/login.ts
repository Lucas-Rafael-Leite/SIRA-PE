import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { Usuario } from '../../models';

@Component({
  selector: 'app-login',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="login">
      <div class="login__panel">
        <div class="login__brand">
          <div class="login__logo"><span class="material-icons-round">health_and_safety</span></div>
          <div>
            <strong>SIRA-PE</strong>
            <span>Sistema Integrado de Regulação Ambulatorial</span>
          </div>
        </div>

        <h1>Acesse o sistema</h1>
        <p class="login__subtitle">
          Selecione um perfil simulado para explorar o protótipo. Não é necessário informar senha.
        </p>

        <div class="login__perfis">
          @for (u of perfis(); track u.id) {
            <button
              class="login__perfil-card"
              [class.login__perfil-card--selected]="selecionado()?.id === u.id"
              (click)="selecionado.set(u)"
            >
              <div class="login__perfil-avatar">{{ u.avatarIniciais }}</div>
              <div class="login__perfil-info">
                <strong>{{ rotuloPerfil(u.perfil) }}</strong>
                <span>{{ u.vinculoNome }}</span>
              </div>
              <span class="material-icons-round login__perfil-check">check_circle</span>
            </button>
          }
        </div>

        <button class="login__entrar" [disabled]="!selecionado()" (click)="entrar()">
          Entrar no sistema
          <span class="material-icons-round">arrow_forward</span>
        </button>

        <p class="login__rodape">Governo do Estado de Pernambuco · Secretaria Estadual de Saúde</p>
      </div>

      <div class="login__hero">
        <div class="login__hero-overlay">
          <span class="sira-eyebrow">GRAMB · GERES · Municípios · Unidades Executantes</span>
          <h2>Regulação ambulatorial<br />com visão de estado inteiro.</h2>
          <p>
            Agendas, vagas, consultas e indicadores das 12 GERES de Pernambuco em um único painel
            de governança.
          </p>
          <div class="login__hero-stats">
            <div><strong>184</strong><span>Municípios</span></div>
            <div><strong>12</strong><span>GERES</span></div>
            <div><strong>96,3 mil</strong><span>Consultas/mês</span></div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrl: './login.scss',
})
export class Login {
  perfis = signal<Usuario[]>([]);
  selecionado = signal<Usuario | null>(null);

  constructor(
    private auth: AuthService,
    private router: Router,
  ) {
    this.perfis.set(this.auth.perfisDisponiveis());
  }

  rotuloPerfil(perfil: string): string {
    const mapa: Record<string, string> = {
      Administrador: 'Administrador',
      GRAMB: 'GRAMB — Regulação Estadual',
      GERES: 'GERES',
      Municipio: 'Município',
      UnidadeExecutante: 'Unidade Executante',
    };
    return mapa[perfil] ?? perfil;
  }

  entrar(): void {
    const usuario = this.selecionado();
    if (!usuario) return;
    this.auth.entrarComo(usuario.id);
    this.router.navigateByUrl('/home');
  }
}
