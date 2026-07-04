import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MUNICIPIOS_MOCK, GERES_MOCK, UES_MOCK } from '../../../mock';
import { Usuario } from '../../../models';

export interface EnviarAlertaDialogData {
  autor: Usuario;
}

interface OpcaoDestino {
  id: string;
  nome: string;
}

@Component({
  selector: 'app-enviar-alerta-dialog',
  standalone: true,
  imports: [FormsModule, MatDialogModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 mat-dialog-title>Enviar alerta</h2>
    <div mat-dialog-content class="conteudo">
      @if (data.autor.perfil === 'GERES') {
        <p class="aviso">Como GERES, você só pode enviar alertas para municípios e UEs sob sua responsabilidade.</p>
      }

      <label class="campo">
        <span>Destino</span>
        <select [(ngModel)]="destino">
          @if (data.autor.perfil !== 'GERES') {
            <option value="geres">GERES</option>
          }
          <option value="municipio">Município</option>
          <option value="ue">Unidade Executante</option>
        </select>
      </label>

      <label class="campo">
        <span>{{ destino() === 'municipio' ? 'Município' : destino() === 'geres' ? 'GERES' : 'Unidade Executante' }}</span>
        <select [(ngModel)]="destinoId">
          <option value="">Selecione</option>
          @for (o of opcoesDestino(); track o.id) { <option [value]="o.id">{{ o.nome }}</option> }
        </select>
      </label>

      <label class="campo">
        <span>Título</span>
        <input type="text" [(ngModel)]="titulo" placeholder="Ex: Agenda com pendência de validação" />
      </label>

      <label class="campo">
        <span>Mensagem</span>
        <textarea rows="3" [(ngModel)]="mensagem" placeholder="Descreva o alerta..."></textarea>
      </label>

      <label class="campo">
        <span>Prioridade</span>
        <select [(ngModel)]="prioridade">
          <option value="baixa">Baixa</option>
          <option value="media">Média</option>
          <option value="alta">Alta</option>
          <option value="critica">Crítica</option>
        </select>
      </label>
    </div>

    <div mat-dialog-actions class="acoes">
      <button class="btn-secondary" (click)="ref.close(null)">Cancelar</button>
      <button class="btn-primary" [disabled]="!titulo() || !mensagem() || !destinoId()" (click)="enviar()">
        <span class="material-icons-round">send</span>
        Enviar alerta
      </button>
    </div>
  `,
  styleUrl: './enviar-alerta-dialog.scss',
})
export class EnviarAlertaDialog {
  ref = inject(MatDialogRef<EnviarAlertaDialog>);
  data = inject<EnviarAlertaDialogData>(MAT_DIALOG_DATA);

  destino = signal<'municipio' | 'geres' | 'ue'>(this.data.autor.perfil === 'GERES' ? 'municipio' : 'geres');
  destinoId = signal('');
  titulo = signal('');
  mensagem = signal('');
  prioridade = signal<'baixa' | 'media' | 'alta' | 'critica'>('media');

  opcoesDestino = computed<OpcaoDestino[]>(() => {
    const perfil = this.data.autor.perfil;
    const vinculoId = this.data.autor.vinculoId;

    if (this.destino() === 'geres') {
      return GERES_MOCK.map((g) => ({ id: g.id, nome: g.nome }));
    }

    if (this.destino() === 'municipio') {
      const lista = perfil === 'GERES' ? MUNICIPIOS_MOCK.filter((m) => m.geresId === vinculoId) : MUNICIPIOS_MOCK;
      return lista.map((m) => ({ id: m.id, nome: m.nome }));
    }

    // ue
    const lista = perfil === 'GERES' ? UES_MOCK.filter((u) => u.geresId === vinculoId) : UES_MOCK;
    return lista.map((u) => ({ id: u.id, nome: u.nome }));
  });

  enviar(): void {
    const opcao = this.opcoesDestino().find((o) => o.id === this.destinoId());
    this.ref.close({
      destino: this.destino(),
      destinoId: this.destinoId(),
      destinoNome: opcao?.nome ?? '',
      titulo: this.titulo(),
      mensagem: this.mensagem(),
      prioridade: this.prioridade(),
    });
  }
}
