# SIRA-PE · Sistema Integrado de Regulação Ambulatorial

Protótipo de alta fidelidade desenvolvido para apresentação à **Secretaria Estadual de Saúde de
Pernambuco (SES-PE)**, destinado à GRAMB, GERES, Municípios e Unidades Executantes para a gestão
da Regulação Ambulatorial.

> ⚠️ **Este é um protótipo de frontend.** Não existe backend. Todos os dados são simulados
> (mockados) em arquivos TypeScript, com latência de rede artificial para demonstrar loading
> states de forma realista. Nenhuma informação é persistida entre sessões (exceto tema e perfil
> selecionado, salvos em `localStorage`/`sessionStorage`).

---

## 1. Instalação

Pré-requisitos: **Node.js 20+** e **npm 10+**.

```bash
npm install
npm start
```

A aplicação sobe em `http://localhost:4200`.

Outros comandos úteis:

```bash
npm run build   # build de produção em dist/
npm run watch   # build contínuo em modo desenvolvimento
npm run lint    # checagem de lint
```

---

## 2. Stack utilizada

| Categoria       | Tecnologia                                              |
| ---------------- | -------------------------------------------------------- |
| Framework         | Angular 20 (Standalone Components, Signals, novo control flow `@if`/`@for`) |
| UI               | Angular Material 20 + Design System próprio (SCSS)       |
| Gráficos         | Chart.js 4 (linha, barra, pizza/doughnut, radar, área)   |
| Estado           | Signals nativos do Angular (sem NgRx)                    |
| Dados            | Mocks TypeScript tipados (sem backend)                   |
| Estilo           | SCSS com Design Tokens via CSS Custom Properties          |
| Lint/Format      | ESLint + Prettier                                         |

Não são utilizados Bootstrap, jQuery, PrimeNG, Nebular, Tailwind ou qualquer outro framework CSS
externo, conforme especificação do projeto.

---

## 3. Perfis de acesso (login simulado)

Não há autenticação real. Na tela de login, selecione um dos 5 perfis simulados:

| Perfil               | Vínculo de exemplo              | Visão do menu                                      |
| --------------------- | -------------------------------- | ---------------------------------------------------- |
| Administrador          | SES-PE                            | Acesso total a todos os módulos                       |
| GRAMB                  | Regulação Estadual                | Acesso total a todos os módulos                       |
| GERES                  | IV GERES - Caruaru                | Municípios, UEs, Consultas, Vagas, Dashboard, Relatórios, Alertas |
| Município              | Caruaru                           | UEs, Consultas, Vagas, Relatórios, Alertas             |
| Unidade Executante     | Policlínica Caruaru               | Consultas, Vagas, Alertas                              |

O perfil selecionado é guardado em `sessionStorage` (chave `sira-pe-usuario`) e usado pelo
`MenuService` para montar o menu lateral dinamicamente (`src/app/services/menu.service.ts`).

---

## 4. Estrutura de pastas

```
src/
  app/
    core/                 → serviços e guards estruturais (auth, tema, guard de rota)
      guards/
      services/
    shared/                → componentes, pipes e diretivas reutilizáveis
      components/
        header/  sidebar/  breadcrumb/  kpi-card/  data-table/
        status-badge/  empty-state/  loading-skeleton/  chart/
    layout/
      main-layout/          → shell com header + sidebar + router-outlet
    models/                 → interfaces TypeScript (um arquivo por entidade + index.ts)
    mock/                   → dados simulados tipados (um arquivo por entidade + index.ts)
    services/               → serviços de domínio que expõem os mocks via Observable
    pages/                  → uma pasta por tela, cada uma com seu componente standalone
      login/  home/  municipios/  municipio-detalhe/  unidades/  unidade-detalhe/
      consultas/ (+ dialogs/)  painel-vagas/  dashboard-analitico/
      relatorios/  alertas/ (+ dialogs/)  auditoria/  configuracoes/
    app.ts / app.config.ts / app.routes.ts
  styles/
    theme/_tokens.scss      → design tokens (cores, tipografia, espaçamento, tema claro/escuro)
  styles.scss                → estilos globais e classes utilitárias reutilizáveis
```

---

## 5. Arquitetura e fluxo de dados

Como não há backend, cada entidade segue o mesmo padrão de 3 camadas:

```
mock/*.mock.ts  →  services/*.service.ts  →  pages/*/*.ts
 (dado bruto)      (Observable + regras)      (consome via subscribe/signals)
```

Os serviços usam `comLatencia()` (`services/base-mock.service.ts`), que envolve os dados mockados
em `of(...).pipe(delay(ms))`, simulando uma chamada de API real — o que permite demonstrar os
`loading skeletons` de forma verossímil.

Serviços com necessidade de mutação local (cancelar consulta, marcar vaga estratégica, enviar
alerta) usam `signal()` internamente para manter o estado em memória durante a sessão do
navegador.

### Autenticação simulada

`AuthService` (`core/services/auth.service.ts`) mantém o usuário logado em um `signal`, persistido
em `sessionStorage`. O `authGuard` (`core/guards/auth.guard.ts`) protege todas as rotas dentro do
`MainLayout`, redirecionando para `/login` quando não há usuário autenticado.

### Tema claro/escuro

`ThemeService` (`core/services/theme.service.ts`) alterna o atributo `data-theme` no
`<html>`, que ativa o bloco `[data-theme='dark']` definido em `styles/theme/_tokens.scss`.
A preferência é persistida em `localStorage`.

---

## 6. Rotas

| Caminho                     | Tela                        |
| ----------------------------- | ------------------------------ |
| `/login`                       | Login (seleção de perfil)      |
| `/home`                        | Dashboard geral                |
| `/municipios`                  | Lista de municípios            |
| `/municipios/:id`              | Detalhe do município           |
| `/unidades`                    | Lista de Unidades Executantes  |
| `/unidades/:id`                | Detalhe da UE                  |
| `/consultas`                   | Consultas (marcar/cancelar)    |
| `/painel-vagas`                | Painel de Vagas (tela principal)|
| `/dashboard-analitico`         | Dashboard Analítico / BI       |
| `/relatorios`                  | Relatórios exportáveis         |
| `/alertas`                     | Alertas (enviar/histórico)     |
| `/auditoria`                   | Auditoria de operações         |
| `/configuracoes`               | Configurações e perfil         |

Todas as rotas (exceto `/login`) usam `loadComponent` (lazy loading) e ficam dentro do
`MainLayout`, protegidas pelo `authGuard`.

---

## 7. Componentes reutilizáveis

| Componente          | Local                                              | Uso                                             |
| --------------------- | ----------------------------------------------------- | -------------------------------------------------- |
| `DataTable`            | `shared/components/data-table`                        | Tabela genérica com paginação, colunas tipadas (`texto`, `badge`, `destaque`) e slot de ações via `TemplateRef` |
| `KpiCard`              | `shared/components/kpi-card`                          | Card de indicador com ícone, valor e tendência   |
| `StatusBadge`          | `shared/components/status-badge`                      | Badge de status com mapeamento automático de cor/rótulo |
| `ChartCanvas`          | `shared/components/chart`                              | Wrapper de Chart.js reativo a mudanças de `config` |
| `EmptyState`           | `shared/components/empty-state`                        | Estado vazio padronizado                          |
| `LoadingSkeleton`      | `shared/components/loading-skeleton`                    | Skeleton loader (variantes `card`, `linha`, `bloco`) |
| `Breadcrumb`           | `shared/components/breadcrumb`                          | Trilha de navegação                               |
| `Header` / `Sidebar`   | `shared/components/header` / `sidebar`                   | Shell da aplicação                                 |

### Exemplo de uso do `DataTable` com ações por linha

```html
<app-data-table
  [dados]="linhas()"
  [colunas]="colunas"
  [carregando]="carregando()"
  [acoesTemplate]="acoesTpl"
/>

<ng-template #acoesTpl let-linha>
  <button class="link-btn" (click)="abrirDetalhe(linha)">Detalhes</button>
</ng-template>
```

---

## 8. Guia de estilos (Design System)

Os tokens de cor, tipografia, forma e elevação vivem em `src/styles/theme/_tokens.scss`, como CSS
Custom Properties. **Nunca usar cores hexadecimais diretamente nos componentes** — sempre
referenciar os tokens (`var(--color-primary-600)`, `var(--surface-card)`, etc.) para que o tema
escuro funcione automaticamente.

- **Azul institucional** (`--color-primary-*`): navegação, ações primárias, links.
- **Verde SUS** (`--color-sus-*`): sucesso, indicadores positivos, marca.
- **Vermelho** (`--color-alert-*`): alertas críticos, cancelamentos, erros.
- **Amarelo** (`--color-pending-*`): pendências, avisos, itens aguardando ação.
- **Cinza/branco**: superfícies, texto secundário, bordas.

Tipografia: **Public Sans** (títulos/display), **Inter** (corpo de texto), **Roboto Mono**
(dados tabulares, protocolos, IDs).

Classes utilitárias globais (em `src/styles.scss`): `.sira-page`, `.sira-page-header`,
`.sira-card`, `.sira-grid--kpi/--2/--3`, `.sira-toolbar`, `.filtro-busca`, `.filtro-select`,
`.btn-primary`, `.btn-secondary`, `.link-btn`, `.chip`.

---

## 9. Como adicionar uma nova tela

1. Crie uma pasta em `src/app/pages/minha-tela/` com `minha-tela.ts` (componente standalone) e,
   se necessário, `minha-tela.scss`.
2. Reaproveite `Breadcrumb`, `DataTable`, `KpiCard`, `StatusBadge` etc. de `shared/components`.
3. Registre a rota em `src/app/app.routes.ts` dentro do array `children` do `MainLayout`, usando
   `loadComponent` para manter o lazy loading.
4. Adicione o item correspondente em `src/app/services/menu.service.ts`, definindo quais perfis
   (`PerfilUsuario[]`) podem visualizá-lo no menu lateral.

## 10. Como adicionar novos mocks

1. Defina a interface da entidade em `src/app/models/minha-entidade.model.ts` e exporte-a em
   `models/index.ts`.
2. Crie o arquivo de dados em `src/app/mock/minha-entidade.mock.ts`, exportando uma constante
   tipada (`export const MINHA_ENTIDADE_MOCK: MinhaEntidade[] = [...]`) e registre-a em
   `mock/index.ts`.
3. Crie um serviço em `src/app/services/minha-entidade.service.ts` que exponha os dados via
   Observable, usando o helper `comLatencia()` para simular latência de rede.

---

## 11. Boas práticas seguidas

- **Standalone Components** em 100% da aplicação (sem NgModules de feature).
- **Signals** para estado local e computeds derivados, evitando `Subscription` manual sempre que
  possível.
- **OnPush** como estratégia de detecção de mudanças em todos os componentes.
- **Lazy loading** de todas as rotas de página via `loadComponent`.
- **Responsabilidade única**: componentes pequenos, cada um com um propósito claro.
- **Sem duplicação de estilo**: tokens de design centralizados; classes utilitárias
  compartilhadas entre páginas.
- **Responsividade**: grids fluidos (`auto-fit`/`minmax`), sidebar recolhível em telas < 900px.

---

## 12. Limitações conhecidas do protótipo

- Não há backend, autenticação real ou persistência além de `localStorage`/`sessionStorage`.
- Exportações de relatórios (PDF/Excel/CSV) e envio de agendas são simulados via notificações
  (snackbar), sem geração real de arquivo.
- Os dados mockados (municípios, GERES, UEs, profissionais, pacientes, consultas, vagas, agendas,
  alertas e auditoria) foram gerados proceduralmente para ter volume realista, mas não
  representam dados reais da SES-PE.

---

Governo do Estado de Pernambuco · Secretaria Estadual de Saúde · Protótipo de demonstração.
