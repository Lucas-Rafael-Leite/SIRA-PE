import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { Sidebar } from '../../shared/components/sidebar/sidebar';
import { Header } from '../../shared/components/header/header';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { MenuService } from '../../services/menu.service';
import { AlertaService } from '../../services/alerta.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, Sidebar, Header],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="layout" [class.layout--collapsed]="sidebarColapsada()">
      <app-sidebar
        [itens]="itensMenu()"
        [colapsada]="sidebarColapsada()"
        (alternarColapso)="sidebarColapsada.set(!sidebarColapsada())"
      />

      <div class="layout__content">
        <app-header
          [usuario]="auth.usuario()"
          [temaEscuro]="theme.tema() === 'dark'"
          [notificacoes]="alertaService.naoLidos()"
          (alternarSidebar)="sidebarColapsada.set(!sidebarColapsada())"
          (alternarTema)="theme.alternar()"
        />

        <main class="layout__main">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styleUrl: './main-layout.scss',
})
export class MainLayout {
  sidebarColapsada = signal(false);
  itensMenu = computed(() => this.menuService.itensPara(this.auth.perfil()));

  constructor(
    public auth: AuthService,
    public theme: ThemeService,
    private menuService: MenuService,
    public alertaService: AlertaService,
    router: Router,
  ) {
    router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => {
      if (window.innerWidth < 900) this.sidebarColapsada.set(true);
    });
  }
}
