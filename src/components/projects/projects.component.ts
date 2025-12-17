import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { SafeHtmlPipe } from '../../pipes/safe-html.pipe';
import { Icons } from '../../services/icons';

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [CommonModule, FormsModule, SafeHtmlPipe],
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-2xl font-bold text-slate-800">Students Directory</h2>
          <p class="text-slate-500 text-sm">Manage student profiles and registration</p>
        </div>
        <button (click)="openCreateModal()" 
                class="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm">
          <span [innerHTML]="Icons.plus | safeHtml"></span>
          Register Student
        </button>
      </div>

      <!-- Students Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        @for (student of dataService.students(); track student.idStudent) {
          <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-all group relative">
            
            <div class="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
              <button (click)="openEditModal(student.idStudent)" 
                      class="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" 
                      title="Edit Student">
                <span [innerHTML]="Icons.edit | safeHtml"></span>
              </button>
              <button (click)="dataService.deleteStudent(student.idStudent)" 
                      class="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                      title="Delete Student">
                <span [innerHTML]="Icons.trash | safeHtml"></span>
              </button>
            </div>

            <div class="flex items-center gap-4 mb-4">
              <div class="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600 flex items-center justify-center font-bold text-lg">
                {{ student.lastName.charAt(0) }}{{ student.firstName.charAt(0) }}
              </div>
              <div>
                <h3 class="font-bold text-slate-900">{{ student.firstName }} {{ student.lastName }}</h3>
                <p class="text-xs text-slate-500">ID: {{ student.idStudent }}</p>
              </div>
            </div>

            <div class="space-y-2 text-sm text-slate-600 border-t border-slate-100 pt-4">
               <div class="flex justify-between">
                 <span class="text-slate-400">Email:</span>
                 <span class="font-medium truncate max-w-[150px]">{{ student.email }}</span>
               </div>
               <div class="flex justify-between">
                 <span class="text-slate-400">Phone:</span>
                 <span class="font-medium">{{ student.phone || 'N/A' }}</span>
               </div>
               @if(student.department) {
                  <div class="flex justify-between">
                    <span class="text-slate-400">Department:</span>
                    <span class="font-medium bg-slate-100 px-2 rounded text-xs">{{ student.department.name }}</span>
                  </div>
               }
            </div>
          </div>
        }
        @empty {
            <div class="col-span-full py-12 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-300">
               <div class="mx-auto w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                 <span [innerHTML]="Icons.students | safeHtml" class="opacity-50"></span>
               </div>
               <p>No students registered yet.</p>
            </div>
        }
      </div>

      <!-- Modal -->
      @if (isModalOpen()) {
        <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div class="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl animate-scale-in">
            <h3 class="text-xl font-bold text-slate-900 mb-4">
              @if(editingId()) { Edit Student } @else { Register New Student }
            </h3>
            
            <div class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                    <input type="text" [(ngModel)]="formData.firstName" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                    <input type="text" [(ngModel)]="formData.lastName" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input type="email" [(ngModel)]="formData.email" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                    <input type="text" [(ngModel)]="formData.phone" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Birth Date</label>
                    <input type="date" [(ngModel)]="formData.dateOfBirth" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Department</label>
                <select [(ngModel)]="formData.departmentId" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                   <option [ngValue]="null">-- No Department --</option>
                   @for(dept of dataService.departments(); track dept.idDepartment) {
                     <option [ngValue]="dept.idDepartment">{{ dept.name }}</option>
                   }
                </select>
              </div>
            </div>

            <div class="flex justify-end gap-3 mt-6">
              <button (click)="isModalOpen.set(false)" class="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors text-sm font-medium">Cancel</button>
              <button (click)="saveStudent()" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
                @if(editingId()) { Update } @else { Register }
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class ProjectsComponent {
  dataService = inject(DataService);
  Icons = Icons;
  
  isModalOpen = signal(false);
  editingId = signal<number | null>(null);

  formData = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    departmentId: null as number | null
  };

  openCreateModal() {
    this.editingId.set(null);
    this.formData = { firstName: '', lastName: '', email: '', phone: '', dateOfBirth: '', departmentId: null };
    this.isModalOpen.set(true);
  }

  async openEditModal(id: number) {
    const student = await this.dataService.getStudent(id);
    if (student) {
      this.formData = {
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        phone: student.phone || '',
        dateOfBirth: student.dateOfBirth || '',
        departmentId: student.department?.idDepartment || null
      };
      this.editingId.set(id);
      this.isModalOpen.set(true);
    }
  }

  saveStudent() {
    if (!this.formData.firstName || !this.formData.lastName || !this.formData.email) return;
    
    // Convert undefined/null to undefined for cleanup
    const payload = {
        firstName: this.formData.firstName,
        lastName: this.formData.lastName,
        email: this.formData.email,
        phone: this.formData.phone,
        dateOfBirth: this.formData.dateOfBirth,
        departmentId: this.formData.departmentId || undefined
    };

    if (this.editingId()) {
      this.dataService.updateStudent({
        idStudent: this.editingId()!,
        ...payload
      });
    } else {
      this.dataService.addStudent(payload);
    }

    this.isModalOpen.set(false);
  }
}
