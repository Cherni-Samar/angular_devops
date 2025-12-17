import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { SafeHtmlPipe } from '../../pipes/safe-html.pipe';
import { Icons } from '../../services/icons';

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [CommonModule, FormsModule, SafeHtmlPipe],
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-2xl font-bold text-slate-800">Departments</h2>
          <p class="text-slate-500 text-sm">Manage university faculties and departments</p>
        </div>
        <button (click)="openCreateModal()" 
                class="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm">
          <span [innerHTML]="Icons.plus | safeHtml"></span>
          Add Department
        </button>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm text-slate-600">
            <thead class="bg-slate-50 text-slate-900 font-medium">
              <tr>
                <th class="px-6 py-4">ID</th>
                <th class="px-6 py-4">Name</th>
                <th class="px-6 py-4">Location</th>
                <th class="px-6 py-4">Head of Dept</th>
                <th class="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (dept of dataService.departments(); track dept.idDepartment) {
                <tr class="hover:bg-slate-50/50 transition-colors">
                  <td class="px-6 py-4 text-slate-500 font-mono">#{{ dept.idDepartment }}</td>
                  <td class="px-6 py-4 font-bold text-slate-900">{{ dept.name }}</td>
                  <td class="px-6 py-4">{{ dept.location || '-' }}</td>
                  <td class="px-6 py-4">{{ dept.head || '-' }}</td>
                  <td class="px-6 py-4 text-right flex justify-end gap-2">
                    <button (click)="openEditModal(dept.idDepartment)" 
                            class="text-slate-400 hover:text-indigo-600 transition-colors p-2 hover:bg-indigo-50 rounded-lg"
                            title="Edit">
                      <span [innerHTML]="Icons.edit | safeHtml"></span>
                    </button>
                    <button (click)="dataService.deleteDepartment(dept.idDepartment)" 
                            class="text-slate-400 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-lg"
                            title="Delete">
                      <span [innerHTML]="Icons.trash | safeHtml"></span>
                    </button>
                  </td>
                </tr>
              }
              @empty {
                 <tr>
                   <td colspan="5" class="px-6 py-12 text-center text-slate-400">
                     <div class="flex flex-col items-center gap-2">
                       <span [innerHTML]="Icons.departments | safeHtml" class="opacity-20 w-8 h-8"></span>
                       No departments found
                     </div>
                   </td>
                 </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Modal -->
      @if (isModalOpen()) {
        <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div class="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl animate-scale-in">
            <h3 class="text-xl font-bold text-slate-900 mb-4">
              @if(editingDeptId()) { Edit Department } @else { Add Department }
            </h3>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Department Name</label>
                <input type="text" [(ngModel)]="formData.name" placeholder="e.g. Computer Science" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
              </div>
              
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Location</label>
                <input type="text" [(ngModel)]="formData.location" placeholder="e.g. Building C" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Head of Department</label>
                <input type="text" [(ngModel)]="formData.head" placeholder="e.g. Dr. Strange" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
              </div>
            </div>

            <div class="flex justify-end gap-3 mt-6">
              <button (click)="isModalOpen.set(false)" class="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors text-sm font-medium">Cancel</button>
              <button (click)="saveDept()" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
                @if(editingDeptId()) { Update } @else { Create }
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class DepartmentsComponent {
  dataService = inject(DataService);
  Icons = Icons;
  
  isModalOpen = signal(false);
  editingDeptId = signal<number | null>(null);
  
  formData = { name: '', location: '', head: '' };

  openCreateModal() {
    this.editingDeptId.set(null);
    this.formData = { name: '', location: '', head: '' };
    this.isModalOpen.set(true);
  }

  async openEditModal(id: number) {
    const dept = await this.dataService.getDepartment(id);
    
    if (dept) {
      this.formData = { 
        name: dept.name, 
        location: dept.location || '',
        head: dept.head || ''
      };
      this.editingDeptId.set(id);
      this.isModalOpen.set(true);
    }
  }

  saveDept() {
    if (!this.formData.name) return;

    if (this.editingDeptId()) {
      this.dataService.updateDepartment({
        idDepartment: this.editingDeptId()!,
        name: this.formData.name,
        location: this.formData.location,
        head: this.formData.head
      });
    } else {
      this.dataService.addDepartment(this.formData);
    }
    
    this.isModalOpen.set(false);
  }
}
