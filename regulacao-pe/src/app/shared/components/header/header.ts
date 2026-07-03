import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Router } from '@angular/router';
import { Usuario } from '../../../models';

@Component({
  selector: 'app-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="app-header">
      <div class="app-header__left">
        <button class="icon-btn app-header__menu-btn" (click)="alternarSidebar.emit()">
          <span class="material-icons-round">menu</span>
        </button>
        <div class="app-header__search">
          <span class="material-icons-round">search</span>
          <input
            type="text"
            placeholder="Buscar município, UE, paciente, protocolo..."
            (keyup.enter)="buscarGlobal.emit(campo.value)"
            #campo
          />
        </div>
      </div>

      <div class="app-header__right">
        <button class="icon-btn" (click)="alternarTema.emit()" title="Alternar tema">
          <span class="material-icons-round">{{ temaEscuro() ? 'light_mode' : 'dark_mode' }}</span>
        </button>

        <button class="icon-btn app-header__bell" (click)="irParaAlertas()" title="Notificações">
          <span class="material-icons-round">notifications</span>
          @if (notificacoes() > 0) {
            <span class="app-header__badge">{{ notificacoes() }}</span>
          }
        </button>

        <div class="app-header__profile" (click)="irParaPerfil()">
          <div class="app-header__avatar">{{ usuario()?.avatarIniciais }}</div>
          <div class="app-header__profile-info">
            <strong>{{ usuario()?.nome }}</strong>
            <small>{{ perfilLabel() }}</small>
          </div>
        </div>
      </div>
    </header>
  `,
  styleUrl: './header.scss',
})
export class Header {
  usuario = input<Usuario | null>(null);
  temaEscuro = input<boolean>(false);
  notificacoes = input<number>(0);

  alternarSidebar = output<void>();
  alternarTema = output<void>();
  buscarGlobal = output<string>();

  constructor(private router: Router) {}

  perfilLabel(): string {
    const mapa: Record<string, string> = {
      Administrador: 'Administrador',
      GRAMB: 'GRAMB',
      GERES: 'GERES',
      Municipio: 'Município',
      UnidadeExecutante: 'Unidade Executante',
    };
    const perfil = this.usuario()?.perfil;
    return perfil ? (mapa[perfil] ?? perfil) : '';
  }

  irParaAlertas(): void {
    this.router.navigateByUrl('/alertas');
  }

  irParaPerfil(): void {
    this.router.navigateByUrl('/configuracoes');
  }
}
