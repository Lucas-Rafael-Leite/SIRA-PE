import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { Alerta, Usuario } from '../models';
import { ALERTAS_MOCK } from '../mock';
import { comLatencia } from './base-mock.service';

/** Perfis que têm permissão de originar um alerta (Administrador, GRAMB e GERES). */
const PERFIS_QUE_ENVIAM = ['Administrador', 'GRAMB', 'GERES'];

@Injectable({ providedIn: 'root' })
export class AlertaService {
  private readonly alertas = signal<Alerta[]>([...ALERTAS_MOCK]);

  listar(): Observable<Alerta[]> {
    return comLatencia(this.alertas());
  }

  /** Notificações recebidas pelo usuário (o que aparece no sino do header e na aba "Recebidos"). */
  recebidosPor(usuario: Usuario | null): Alerta[] {
    if (!usuario) return [];
    if (usuario.perfil === 'Administrador' || usuario.perfil === 'GRAMB') {
      // Administrador e GRAMB estão no topo da hierarquia: veem tudo que foi emitido por outros.
      return this.alertas().filter((a) => a.autorPerfil !== usuario.perfil);
    }
    return this.alertas().filter((a) => a.destinoId === usuario.vinculoId);
  }

  /** Histórico de alertas emitidos pelo próprio usuário (não existe para Município/UE). */
  enviadosPor(usuario: Usuario | null): Alerta[] {
    if (!usuario || !this.podeEnviar(usuario)) return [];
    if (usuario.perfil === 'Administrador' || usuario.perfil === 'GRAMB') {
      return this.alertas().filter((a) => a.autorPerfil === usuario.perfil);
    }
    // GERES: alertas enviados por ela para seus municípios/UEs.
    return this.alertas().filter(
      (a) => a.autorPerfil === 'GERES' && a.autor === usuario.nome,
    );
  }

  podeEnviar(usuario: Usuario | null): boolean {
    return !!usuario && PERFIS_QUE_ENVIAM.includes(usuario.perfil);
  }

  naoLidosPara(usuario: Usuario | null): number {
    return this.recebidosPor(usuario).filter((a) => !a.lido).length;
  }

  enviar(alerta: Partial<Alerta>, autor: Usuario): void {
    const novo: Alerta = {
      id: `alr-${Math.floor(Math.random() * 90000 + 10000)}`,
      titulo: alerta.titulo ?? '',
      mensagem: alerta.mensagem ?? '',
      destino: alerta.destino ?? 'municipio',
      destinoId: alerta.destinoId ?? '',
      destinoNome: alerta.destinoNome ?? '',
      prioridade: alerta.prioridade ?? 'media',
      dataEnvio: new Date().toLocaleDateString('pt-BR'),
      autor: autor.nome,
      autorPerfil: autor.perfil,
      lido: false,
    };
    this.alertas.update((lista) => [novo, ...lista]);
  }
}
