import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-criar-relatorio-dialog',
  standalone: true,
  imports: [FormsModule, MatDialogModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 mat-dialog-title>Criar relatório</h2>
    <div mat-dialog-content class="conteudo">
      <label class="campo">
        <span>Nome do relatório</span>
        <input type="text" [(ngModel)]="nome" placeholder="Ex: Ocupação de vagas - Julho/2026" />
      </label>
      <label class="campo">
        <span>Tipo</span>
        <select [(ngModel)]="tipo">
          <option value="Consultas">Consultas</option>
          <option value="Vagas">Vagas</option>
          <option value="Indicadores">Indicadores</option>
          <option value="Auditoria">Auditoria</option>
          <option value="Alertas">Alertas</option>
          <option value="Agendas">Agendas</option>
        </select>
      </label>
      <label class="campo">
        <span>Formato de exportação</span>
        <select [(ngModel)]="formato">
          <option value="PDF">PDF</option>
          <option value="Excel">Excel</option>
          <option value="CSV">CSV</option>
        </select>
      </label>
    </div>
    <div mat-dialog-actions class="acoes">
      <button class="btn-secondary" (click)="ref.close(null)">Cancelar</button>
      <button class="btn-primary" [disabled]="!nome()" (click)="gerar()">
        <span class="material-icons-round">summarize</span>
        Gerar relatório
      </button>
    </div>
  `,
  styleUrl: './criar-relatorio-dialog.scss',
})
export class CriarRelatorioDialog {
  ref = inject(MatDialogRef<CriarRelatorioDialog>);

  nome = signal('');
  tipo = signal<'Consultas' | 'Vagas' | 'Indicadores' | 'Auditoria' | 'Alertas' | 'Agendas'>('Indicadores');
  formato = signal<'PDF' | 'Excel' | 'CSV'>('PDF');

  gerar(): void {
    this.ref.close({ nome: this.nome(), tipo: this.tipo(), formato: this.formato() });
  }
}
