import { Injectable, computed, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { MUNICIPIOS_MOCK, UES_MOCK } from '../../mock';
import { Municipio, UnidadeExecutante, PerfilUsuario } from '../../models';

/**
 * Centraliza as regras de visibilidade de dados por perfil, evitando espalhar
 * comparações de hierarquia (GRAMB > GERES > Município > UE) pelas páginas.
 */
@Injectable({ providedIn: 'root' })
export class EscopoService {
  private auth = inject(AuthService);

  perfil = computed<PerfilUsuario | null>(() => this.auth.perfil());
  vinculoId = computed<string | null>(() => this.auth.usuario()?.vinculoId ?? null);
  vinculoNome = computed<string>(() => this.auth.usuario()?.vinculoNome ?? '');

  /** A minha UE (quando o perfil logado é Unidade Executante). */
  minhaUe = computed<UnidadeExecutante | undefined>(() => {
    if (this.perfil() !== 'UnidadeExecutante') return undefined;
    return UES_MOCK.find((u) => u.id === this.vinculoId());
  });

  /** O meu município (quando o perfil logado é Município). */
  meuMunicipio = computed<Municipio | undefined>(() => {
    if (this.perfil() !== 'Municipio') return undefined;
    return MUNICIPIOS_MOCK.find((m) => m.id === this.vinculoId());
  });

  visualizaTudo(): boolean {
    return this.perfil() === 'Administrador' || this.perfil() === 'GRAMB';
  }

  /** Filtra municípios visíveis para o perfil atual. */
  filtrarMunicipios(lista: Municipio[]): Municipio[] {
    const perfil = this.perfil();
    if (perfil === 'GERES') {
      return lista.filter((m) => m.geresId === this.vinculoId());
    }
    if (perfil === 'Municipio') {
      return lista.filter((m) => m.id === this.vinculoId());
    }
    return lista; // Administrador, GRAMB
  }

  /** Filtra UEs visíveis para o perfil atual. */
  filtrarUes(lista: UnidadeExecutante[]): UnidadeExecutante[] {
    const perfil = this.perfil();
    if (perfil === 'GERES') {
      return lista.filter((u) => u.geresId === this.vinculoId());
    }
    if (perfil === 'Municipio') {
      return lista.filter((u) => u.municipioId === this.vinculoId());
    }
    if (perfil === 'UnidadeExecutante') {
      return lista.filter((u) => u.id === this.vinculoId());
    }
    return lista; // Administrador, GRAMB (podem pesquisar todas)
  }

  /** Verifica se uma UE está sob a responsabilidade direta do usuário logado (para ações de gestão). */
  ueEhResponsabilidadeDireta(ue: UnidadeExecutante): boolean {
    const perfil = this.perfil();
    if (perfil === 'Administrador') return true;
    if (perfil === 'GRAMB') return ue.nivelRegulacao === 'central';
    if (perfil === 'GERES') return ue.geresId === this.vinculoId();
    if (perfil === 'Municipio') return ue.municipioId === this.vinculoId();
    if (perfil === 'UnidadeExecutante') return ue.id === this.vinculoId();
    return false;
  }

  /** Filtra por nome de município/UE genérico (usado em consultas e vagas que já trazem os nomes desnormalizados). */
  filtrarPorMunicipioNome<T extends { municipioNome: string }>(lista: T[]): T[] {
    const perfil = this.perfil();
    if (perfil === 'Municipio') {
      return lista.filter((item) => item.municipioNome === this.vinculoNome());
    }
    return lista;
  }

  filtrarPorGeresNome<T extends { geresNome: string }>(lista: T[]): T[] {
    const perfil = this.perfil();
    if (perfil === 'GERES') {
      return lista.filter((item) => item.geresNome === this.vinculoNome());
    }
    return lista;
  }

  filtrarPorUeId<T extends { ueId: string }>(lista: T[]): T[] {
    const perfil = this.perfil();
    if (perfil === 'UnidadeExecutante') {
      return lista.filter((item) => item.ueId === this.vinculoId());
    }
    return lista;
  }

  /**
   * Escopo genérico para entidades desnormalizadas que trazem `ueId` e `municipioNome`
   * (Consulta, Vaga): aplica a regra de visibilidade de acordo com o perfil logado.
   */
  filtrarPorHierarquia<T extends { ueId?: string; municipioNome?: string }>(lista: T[]): T[] {
    const perfil = this.perfil();

    if (perfil === 'UnidadeExecutante') {
      const minhaUeId = this.vinculoId();
      return lista.filter((item) => item.ueId === minhaUeId);
    }

    if (perfil === 'Municipio') {
      const nomeMunicipio = this.vinculoNome();
      return lista.filter((item) => item.municipioNome === nomeMunicipio);
    }

    if (perfil === 'GERES') {
      const municipiosDaGeres = new Set(
        MUNICIPIOS_MOCK.filter((m) => m.geresId === this.vinculoId()).map((m) => m.nome),
      );
      return lista.filter((item) => item.municipioNome && municipiosDaGeres.has(item.municipioNome));
    }

    return lista; // Administrador, GRAMB
  }

  /** Verifica se um único item (vaga/consulta) está dentro do escopo de atuação do usuário logado. */
  estaNoMeuEscopo(item: { ueId?: string; municipioNome?: string }): boolean {
    return this.filtrarPorHierarquia([item]).length > 0;
  }
}
