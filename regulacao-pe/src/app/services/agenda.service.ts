import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { Agenda } from '../models';
import { AGENDAS_MOCK } from '../mock';
import { comLatencia } from './base-mock.service';

@Injectable({ providedIn: 'root' })
export class AgendaService {
  private readonly agendas = signal<Agenda[]>([...AGENDAS_MOCK]);

  listar(): Observable<Agenda[]> {
    return comLatencia(this.agendas());
  }

  listarPorUe(ueId: string): Observable<Agenda[]> {
    return comLatencia(this.agendas().filter((a) => a.ueId === ueId));
  }
}
