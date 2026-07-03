import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  constructor(private snackBar: MatSnackBar) {}

  sucesso(mensagem: string): void {
    this.snackBar.open(mensagem, 'Fechar', { duration: 3500, panelClass: 'sira-snack-success' });
  }

  erro(mensagem: string): void {
    this.snackBar.open(mensagem, 'Fechar', { duration: 4500, panelClass: 'sira-snack-error' });
  }

  info(mensagem: string): void {
    this.snackBar.open(mensagem, 'Fechar', { duration: 3000, panelClass: 'sira-snack-info' });
  }
}
