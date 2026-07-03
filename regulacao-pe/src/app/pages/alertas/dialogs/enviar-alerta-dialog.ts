import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MUNICIPIOS_MOCK, GERES_MOCK, UES_MOCK } from '../../../mock';

@Component({
  selector: 'app-enviar-alerta-dialog',
  standalone: true,
  imports: [FormsModule, MatDialogModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 mat-dialog-title>Enviar alerta</h2>
    <div mat-dialog-content class="conteudo">
      <label class="campo">
        <span>Destino</span>
        <select [(ngModel)]="destino">
          <option value="municipio">Município</option>
          <option value="geres">GERES</option>
          <option value="ue">Unidade Executante</option>
        </select>
      </label>

      <label class="campo">
        <span>{{ destino() === 'municipio' ? 'Município' : destino() === 'geres' ? 'GERES' : 'Unidade Executante' }}</span>
        <select [(ngModel)]="destinoNome">
          <option value="">Selecione</option>
          @if (destino() === 'municipio') {
            @for (m of municipios; track m.id) { <option [value]="m.nome">{{ m.nome }}</option> }
          } @else if (destino() === 'geres') {
            @for (g of geresLista; track g.id) { <option [value]="g.nome">{{ g.nome }}</option> }
          } @else {
            @for (u of ues; track u.id) { <option [value]="u.nome">{{ u.nome }}</option> }
          }
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
      <button class="btn-primary" [disabled]="!titulo() || !mensagem() || !destinoNome()" (click)="enviar()">
        <span class="material-icons-round">send</span>
        Enviar alerta
      </button>
    </div>
  `,
  styleUrl: './enviar-alerta-dialog.scss',
})
export class EnviarAlertaDialog {
  ref = inject(MatDialogRef<EnviarAlertaDialog>);

  municipios = MUNICIPIOS_MOCK;
  geresLista = GERES_MOCK;
  ues = UES_MOCK;

  destino = signal<'municipio' | 'geres' | 'ue'>('municipio');
  destinoNome = signal('');
  titulo = signal('');
  mensagem = signal('');
  prioridade = signal<'baixa' | 'media' | 'alta' | 'critica'>('media');

  enviar(): void {
    this.ref.close({
      destino: this.destino(),
      destinoNome: this.destinoNome(),
      titulo: this.titulo(),
      mensagem: this.mensagem(),
      prioridade: this.prioridade(),
    });
  }
}
