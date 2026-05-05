/**
 * Confirm Dialog Component
 * ========================
 * Modal for confirming destructive actions (delete).
 */

import { Component, output, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAlertTriangle, LucideX } from '@lucide/angular';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, LucideAlertTriangle],
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
           (click)="onBackdropClick($event)">
        <div class="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 transform transition-all">
          
          <!-- Header -->
          <div class="flex items-center gap-3 mb-4">
            <div class="p-2 bg-red-100 rounded-full">
              <svg lucideAlertTriangle class="w-5 h-5 text-red-600"></svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900">{{ title() }}</h3>
          </div>
          
          <!-- Message -->
          <p class="text-gray-600 mb-6">{{ message() }}</p>
          
          <!-- Actions -->
          <div class="flex justify-end gap-3">
            <button 
              (click)="onCancel()"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg 
                     hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button 
              (click)="onConfirm()"
              class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg 
                     hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class ConfirmDialogComponent {
  isOpen = input.required<boolean>();
  title = input<string>('Confirm Delete');
  message = input<string>('Are you sure you want to delete this item?');
  
  confirmed = output<void>();
  cancelled = output<void>();

  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.cancelled.emit();
    }
  }

  onConfirm() {
    this.confirmed.emit();
  }

  onCancel() {
    this.cancelled.emit();
  }
}