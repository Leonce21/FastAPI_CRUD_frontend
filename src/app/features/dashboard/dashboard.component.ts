import { Component, OnInit, signal, computed, inject, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  LucidePlus, LucideSearch, LucidePencil, LucideTrash2, 
  LucidePackage, LucideChevronLeft, LucideChevronRight,
  LucideX, LucideCheck, LucideLoader2, LucideTag,
  LucideDollarSign, LucideBoxes
} from '@lucide/angular';
import { ItemService } from '../../core/services/item.service';
import { 
  ItemCreate, 
  ItemUpdate, 
  ItemInDB, 
  ItemsListResponse 
} from '../../core/models/item.model';
import { ToastComponent } from '../../shared/components/toast/toast.component';
import { finalize } from 'rxjs';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucidePlus, LucideSearch, LucidePencil, LucideTrash2,
    LucidePackage, LucideChevronLeft, LucideChevronRight,
    LucideX, LucideCheck, LucideLoader2, LucideTag,
    LucideDollarSign, LucideBoxes,
    ToastComponent,
    ConfirmDialogComponent
  ],
  template: `
    <div class="min-h-screen bg-gray-50">
      
      <app-toast #toast></app-toast>
      
      <app-confirm-dialog
        [isOpen]="showDeleteDialog()"
        [title]="'Delete Item'"
        [message]="'Are you sure you want to delete &quot;' + itemToDelete()?.name + '&quot;? This action cannot be undone.'"
        (confirmed)="confirmDelete()"
        (cancelled)="showDeleteDialog.set(false)"
      ></app-confirm-dialog>
      
      <header class="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-16">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-indigo-100 rounded-lg">
                <svg lucidePackage class="w-6 h-6 text-indigo-600"></svg>
              </div>
              <div>
                <h1 class="text-xl font-bold text-gray-900">Items Manager</h1>
                <p class="text-xs text-gray-500">FastAPI + MongoDB CRUD</p>
              </div>
            </div>
            
            <button 
              (click)="openCreateModal()"
              class="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg 
                     hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md"
            >
              <svg lucidePlus class="w-4 h-4"></svg>
              <span class="text-sm font-medium">Add Item</span>
            </button>
          </div>
        </div>
      </header>

      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div class="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-blue-100 rounded-lg">
                <svg lucideBoxes class="w-5 h-5 text-blue-600"></svg>
              </div>
              <div>
                <p class="text-sm text-gray-500">Total Items</p>
                <p class="text-2xl font-bold text-gray-900">{{ totalItems() }}</p>
              </div>
            </div>
          </div>
          
          <div class="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-emerald-100 rounded-lg">
                <svg lucideDollarSign class="w-5 h-5 text-emerald-600"></svg>
              </div>
              <div>
                <p class="text-sm text-gray-500">Avg Price</p>
                <p class="text-2xl font-bold text-gray-900">{{ avgPrice() | currency }}</p>
              </div>
            </div>
          </div>
          
          <div class="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-amber-100 rounded-lg">
                <svg lucideTag class="w-5 h-5 text-amber-600"></svg>
              </div>
              <div>
                <p class="text-sm text-gray-500">Categories</p>
                <p class="text-2xl font-bold text-gray-900">{{ uniqueCategories() }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6">
          <div class="flex flex-col sm:flex-row gap-4">
            <div class="relative flex-1">
              <svg lucideSearch class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"></svg>
              <input 
                type="text" 
                [(ngModel)]="searchQuery"
                (ngModelChange)="onSearch($event)"
                placeholder="Search items by name..."
                class="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg 
                       text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                       placeholder:text-gray-400"
              />
              @if (searchQuery()) {
                <button 
                  (click)="clearSearch()"
                  class="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <svg lucideX class="w-4 h-4 text-gray-400 hover:text-gray-600"></svg>
                </button>
              }
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          @if (loading()) {
            <div class="flex items-center justify-center py-20">
              <svg lucideLoader2 class="w-8 h-8 text-indigo-600 animate-spin"></svg>
              <span class="ml-3 text-gray-500">Loading items...</span>
            </div>
          } @else if (items().length === 0) {
            <div class="flex flex-col items-center justify-center py-20 text-gray-400">
              <svg lucidePackage class="w-16 h-16 mb-4 text-gray-300"></svg>
              <p class="text-lg font-medium">No items found</p>
              <p class="text-sm">Create your first item to get started</p>
            </div>
          } @else {
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Item</th>
                    <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                    <th class="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                    <th class="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock</th>
                    <th class="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  @for (item of items(); track item._id) {
                    <tr class="hover:bg-gray-50 transition-colors group">
                      <td class="px-6 py-4">
                        <div class="flex items-center gap-3">
                          <div class="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                            <span class="text-lg font-bold text-indigo-600">{{ item.name[0] }}</span>
                          </div>
                          <div>
                            <p class="text-sm font-medium text-gray-900">{{ item.name }}</p>
                            @if (item.description) {
                              <p class="text-xs text-gray-500 truncate max-w-xs">{{ item.description }}</p>
                            }
                          </div>
                        </div>
                      </td>
                      <td class="px-6 py-4">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {{ item.category || 'general' }}
                        </span>
                      </td>
                      <td class="px-6 py-4 text-right">
                        <span class="text-sm font-semibold text-gray-900">{{ item.price | currency }}</span>
                      </td>
                      <td class="px-6 py-4 text-right">
                        <span class="text-sm" [class]="item.quantity > 10 ? 'text-emerald-600' : 'text-amber-600'">
                          {{ item.quantity }}
                        </span>
                      </td>
                      <td class="px-6 py-4">
                        <div class="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            (click)="openEditModal(item)"
                            class="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                            title="Edit"
                          >
                            <svg lucidePencil class="w-4 h-4"></svg>
                          </button>
                          <button 
                            (click)="requestDelete(item)"
                            class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete"
                          >
                            <svg lucideTrash2 class="w-4 h-4"></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            @if (totalPages() > 1) {
              <div class="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
                <p class="text-sm text-gray-500">
                  Page {{ currentPage() }} of {{ totalPages() }} ({{ totalItems() }} total)
                </p>
                <div class="flex items-center gap-2">
                  <button 
                    (click)="prevPage()"
                    [disabled]="currentPage() === 1"
                    class="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 
                           hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <svg lucideChevronLeft class="w-4 h-4"></svg>
                  </button>
                  <button 
                    (click)="nextPage()"
                    [disabled]="currentPage() === totalPages()"
                    class="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 
                           hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <svg lucideChevronRight class="w-4 h-4"></svg>
                  </button>
                </div>
              </div>
            }
          }
        </div>
      </main>

      @if (showModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
             (click)="onModalBackdrop($event)">
          <div class="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 transform transition-all">
            
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-bold text-gray-900">
                {{ editingItem() ? 'Edit Item' : 'Create New Item' }}
              </h2>
              <button (click)="closeModal()" class="p-1 text-gray-400 hover:text-gray-600 rounded-lg">
                <svg lucideX class="w-5 h-5"></svg>
              </button>
            </div>

            <form (ngSubmit)="onSubmit()" #itemForm="ngForm" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input 
                  type="text" 
                  [(ngModel)]="formData.name"
                  name="name"
                  required
                  minlength="1"
                  maxlength="100"
                  class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="e.g., MacBook Pro"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  [(ngModel)]="formData.description"
                  name="description"
                  rows="2"
                  maxlength="500"
                  class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  placeholder="Optional description..."
                ></textarea>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                  <div class="relative">
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                    <input 
                      type="number" 
                      [(ngModel)]="formData.price"
                      name="price"
                      required
                      min="0.01"
                      step="0.01"
                      class="w-full pl-7 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm
                             focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input 
                    type="number" 
                    [(ngModel)]="formData.quantity"
                    name="quantity"
                    min="0"
                    class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input 
                  type="text" 
                  [(ngModel)]="formData.category"
                  name="category"
                  class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="e.g., electronics"
                />
              </div>

              <div class="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button 
                  type="button"
                  (click)="closeModal()"
                  class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg 
                         hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  [disabled]="!itemForm.form.valid || formLoading()"
                  class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 
                         rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed 
                         transition-all"
                >
                  @if (formLoading()) {
                    <svg lucideLoader2 class="w-4 h-4 animate-spin"></svg>
                    <span>Saving...</span>
                  } @else {
                    <svg lucideCheck class="w-4 h-4"></svg>
                    <span>{{ editingItem() ? 'Update' : 'Create' }}</span>
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `
})
export class DashboardComponent implements OnInit {
  private readonly itemService = inject(ItemService);
  toast = viewChild.required<ToastComponent>('toast');
  
  items = signal<ItemInDB[]>([]);
  loading = signal(false);
  currentPage = signal(1);
  perPage = signal(10);
  totalItems = signal(0);
  totalPages = signal(1);
  searchQuery = signal('');
  
  showModal = signal(false);
  editingItem = signal<ItemInDB | null>(null);
  formData: { name: string; description: string; price: number; quantity: number; category: string } = {
    name: '',
    description: '',
    price: 0,
    quantity: 0,
    category: ''
  };
  formLoading = signal(false);
  
  showDeleteDialog = signal(false);
  itemToDelete = signal<ItemInDB | null>(null);
  
  avgPrice = computed(() => {
    const items = this.items();
    if (items.length === 0) return 0;
    return items.reduce((sum, item) => sum + item.price, 0) / items.length;
  });
  
  uniqueCategories = computed(() => {
    const categories = new Set(this.items().map(i => i.category || 'general'));
    return categories.size;
  });

  ngOnInit() {
    this.loadItems();
  }

  loadItems() {
    this.loading.set(true);
    this.itemService.getAll(this.currentPage(), this.perPage())
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          this.items.set(response.data);
          this.totalItems.set(response.total);
          this.totalPages.set(response.total_pages);
        },
        error: (err) => this.toast().show(err.message, 'error')
      });
  }

  private searchTimeout: any;
  onSearch(query: string) {
    clearTimeout(this.searchTimeout);
    this.searchQuery.set(query);
    
    if (!query.trim()) {
      this.loadItems();
      return;
    }
    
    this.searchTimeout = setTimeout(() => {
      this.loading.set(true);
      this.itemService.search(query)
        .pipe(finalize(() => this.loading.set(false)))
        .subscribe({
          next: (response) => {
            this.items.set(response.data);
            this.totalItems.set(response.total);
            this.totalPages.set(1);
          },
          error: (err) => this.toast().show(err.message, 'error')
        });
    }, 300);
  }

  clearSearch() {
    this.searchQuery.set('');
    this.loadItems();
  }

  prevPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
      this.loadItems();
    }
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
      this.loadItems();
    }
  }

  openCreateModal() {
    this.editingItem.set(null);
    this.formData = {
      name: '',
      description: '',
      price: 0,
      quantity: 0,
      category: ''
    };
    this.showModal.set(true);
  }

  openEditModal(item: ItemInDB) {
    this.editingItem.set(item);
    this.formData = {
      name: item.name,
      description: item.description || '',
      price: item.price,
      quantity: item.quantity,
      category: item.category || ''
    };
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.editingItem.set(null);
  }

  onModalBackdrop(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  onSubmit() {
    const data = this.formData;
    
    if (!data.name || !data.price) {
      this.toast().show('Please fill in all required fields', 'error');
      return;
    }

    this.formLoading.set(true);
    const editing = this.editingItem();

    const operation = editing
      ? this.itemService.update(editing._id, data as ItemUpdate)
      : this.itemService.create(data as ItemCreate);

    operation.pipe(finalize(() => this.formLoading.set(false)))
      .subscribe({
        next: () => {
          this.toast().show(
            editing ? 'Item updated successfully' : 'Item created successfully',
            'success'
          );
          this.closeModal();
          this.loadItems();
        },
        error: (err) => this.toast().show(err.message, 'error')
      });
  }

  requestDelete(item: ItemInDB) {
    this.itemToDelete.set(item);
    this.showDeleteDialog.set(true);
  }

  confirmDelete() {
    const item = this.itemToDelete();
    if (!item) return;
    
    this.itemService.delete(item._id).subscribe({
      next: () => {
        this.toast().show('Item deleted successfully', 'success');
        this.showDeleteDialog.set(false);
        this.itemToDelete.set(null);
        this.loadItems();
      },
      error: (err) => {
        this.toast().show(err.message, 'error');
        this.showDeleteDialog.set(false);
      }
    });
  }
}