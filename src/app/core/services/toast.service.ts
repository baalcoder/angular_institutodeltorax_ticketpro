import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  readonly toasts = signal<Toast[]>([]);

  show(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    const id = crypto.randomUUID();
    const newToast: Toast = { id, message, type };
    
    this.toasts.update(current => [...current, newToast]);

    // Auto-remove after 3 seconds
    setTimeout(() => this.remove(id), 3000);
  }

  remove(id: string): void {
    this.toasts.update(current => current.filter(t => t.id !== id));
  }
}