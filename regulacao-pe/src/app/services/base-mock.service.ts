import { of, delay } from 'rxjs';

/** Simula latência de rede para exibir skeleton loaders de forma realista. */
export function comLatencia<T>(valor: T, ms = 500) {
  return of(valor).pipe(delay(ms));
}
