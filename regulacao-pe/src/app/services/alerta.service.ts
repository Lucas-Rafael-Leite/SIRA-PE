import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { Alerta } from '../models';
import { ALERTAS_MOCK } from '../mock';
import { comLatencia } from './base-mock.service';

@Injectable({ providedIn: 'root' })
export class AlertaService {
  private readonly alertas = signal<Alerta[]>([...ALERTAS_MOCK]);

  listar(): Observable<Alerta[]> {
    return comLatencia(this.alertas());
  }

  naoLidos(): number {
    return this.alertas().filter((a) => !a.lido).length;
  }

  enviar(alerta: Partial<Alerta>): void {
    const novo: Alerta = {
      id: `alr-${Math.floor(Math.random() * 9000 + 1000)}`,
      titulo: alerta.titulo ?? '',
      mensagem: alerta.mensagem ?? '',
      destino: alerta.destino ?? 'municipio',
      destinoNome: alerta.destinoNome ?? '',
      prioridade: alerta.prioridade ?? 'media',
      dataEnvio: new Date().toLocaleDateString('pt-BR'),
      autor: 'Você',
      lido: false,
    };
    this.alertas.update((lista) => [novo, ...lista]);
  }
}
