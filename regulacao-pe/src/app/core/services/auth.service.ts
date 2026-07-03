import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Usuario, PerfilUsuario } from '../../models';
import { USUARIOS_MOCK } from '../../mock';

const STORAGE_KEY = 'sira-pe-usuario';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly usuarioSignal = signal<Usuario | null>(this.recuperarSessao());

  readonly usuario = this.usuarioSignal.asReadonly();
  readonly autenticado = computed(() => this.usuarioSignal() !== null);
  readonly perfil = computed<PerfilUsuario | null>(() => this.usuarioSignal()?.perfil ?? null);

  constructor(private router: Router) {}

  perfisDisponiveis(): Usuario[] {
    return USUARIOS_MOCK;
  }

  entrarComo(usuarioId: string): void {
    const usuario = USUARIOS_MOCK.find((u) => u.id === usuarioId) ?? null;
    this.usuarioSignal.set(usuario);
    if (usuario) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(usuario));
    }
  }

  sair(): void {
    this.usuarioSignal.set(null);
    sessionStorage.removeItem(STORAGE_KEY);
    this.router.navigateByUrl('/login');
  }

  private recuperarSessao(): Usuario | null {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Usuario) : null;
    } catch {
      return null;
    }
  }
}
