/**
 * Toast Notification Component
 * ==============================
 * Displays temporary success/error messages.
 * Uses Angular signals for reactive state.
 */

import { Component, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideCheck, LucideX } from '@lucide/angular';

export interface ToastMessage {
  id: number;
  type: 'success' | 'error';
  message: string;
}

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule, LucideCheck, LucideX],
  template: `
    <div class="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      @for (toast of toasts(); track toast.id) {
        <div 
          class="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg 
                 transform transition-all duration-300 animate-in slide-in-from-right"
          [class]="toast.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
            : 'bg-red-50 text-red-800 border border-red-200'"
        >
          @if (toast.type === 'success') {
            <svg lucideCheck class="w-5 h-5 text-emerald-600"></svg>
          } @else {
            <svg lucideX class="w-5 h-5 text-red-600"></svg>
          }
          <span class="text-sm font-medium">{{ toast.message }}</span>
        </div>
      }
    </div>
  `
})
export class ToastComponent {
  toasts = signal<ToastMessage[]>([]);
  private idCounter = 0;

  show(message: string, type: 'success' | 'error' = 'success', duration: number = 3000) {
    const id = ++this.idCounter;
    this.toasts.update(t => [...t, { id, type, message }]);
    
    // Auto-remove after duration
    setTimeout(() => this.remove(id), duration);
  }

  private remove(id: number) {
    this.toasts.update(t => t.filter(toast => toast.id !== id));
  }
}