import { Injectable, signal, effect } from '@angular/core';

export type Tema = 'light' | 'dark';
const STORAGE_KEY = 'sira-pe-tema';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly tema = signal<Tema>(this.temaInicial());

  constructor() {
    effect(() => {
      const tema = this.tema();
      document.documentElement.setAttribute('data-theme', tema);
      localStorage.setItem(STORAGE_KEY, tema);
    });
  }

  alternar(): void {
    this.tema.set(this.tema() === 'light' ? 'dark' : 'light');
  }

  definir(tema: Tema): void {
    this.tema.set(tema);
  }

  private temaInicial(): Tema {
    const salvo = localStorage.getItem(STORAGE_KEY) as Tema | null;
    if (salvo === 'light' || salvo === 'dark') return salvo;
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
}
