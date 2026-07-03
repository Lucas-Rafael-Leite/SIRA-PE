import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Geres } from '../models';
import { GERES_MOCK } from '../mock';
import { comLatencia } from './base-mock.service';

@Injectable({ providedIn: 'root' })
export class GeresService {
  listar(): Observable<Geres[]> {
    return comLatencia(GERES_MOCK);
  }
}
