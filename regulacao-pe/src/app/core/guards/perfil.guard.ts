import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { PerfilUsuario } from '../../models';

/**
 * Bloqueia o acesso direto por URL a rotas que não pertencem ao menu do perfil logado.
 * Isso complementa o `authGuard`, que só garante que exista uma sessão simulada.
 */
export function perfilGuard(perfisPermitidos: PerfilUsuario[]): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const perfil = auth.perfil();

    if (perfil && perfisPermitidos.includes(perfil)) {
      return true;
    }

    router.navigateByUrl('/home');
    return false;
  };
}
