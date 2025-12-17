import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { EnrollmentStatus } from '../../models/types';
import { SafeHtmlPipe } from '../../pipes/safe-html.pipe';
import { Icons } from '../../services/icons';

@Component({
  selector: 'app-enrollments',
  standalone: true,
  imports: [CommonModule, FormsModule, SafeHtmlPipe],
  template: `
    <div class="h-full flex flex-col">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h2 class="text-2xl font-bold text-slate-800">Enrollment Board</h2>
          <p class="text-slate-500 text-sm">Track student progress by status</p>
        </div>
        
        <button (click)="openCreateModal()" class="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
             <span [innerHTML]="Icons.plus | safeHtml"></span> New Enrollment
        </button>
      </div>

      <!-- Board Columns -->
      <div class="flex-grow grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4 h-full overflow-hidden overflow-x-auto pb-2">
        
        <!-- Active -->
        <ng-container *ngTemplateOutlet="column; context: {title: 'Active', color: 'blue', items: activeEnrollments(), status: 'ACTIVE'}"></ng-container>
        
        <!-- Completed -->
        <ng-container *ngTemplateOutlet="column; context: {title: 'Completed', color: 'green', items: completedEnrollments(), status: 'COMPLETED'}"></ng-container>
        
        <!-- Failed -->
        <ng-container *ngTemplateOutlet="column; context: {title: 'Failed', color: 'red', items: failedEnrollments(), status: 'FAILED'}"></ng-container>

         <!-- Dropped -->
        <ng-container *ngTemplateOutlet="column; context: {title: 'Dropped', color: 'gray', items: droppedEnrollments(), status: 'DROPPED'}"></ng-container>

         <!-- Withdrawn -->
        <ng-container *ngTemplateOutlet="column; context: {title: 'Withdrawn', color: 'orange', items: withdrawnEnrollments(), status: 'WITHDRAWN'}"></ng-container>

      </div>
    </div>

    <!-- Column Template -->
    <ng-template #column let-title="title" let-color="color" let-items="items" let-status="status">
        <div class="flex flex-col h-full rounded-xl border border-slate-200 min-w-[250px]" [ngClass]="'bg-' + color + '-50/30 border-' + color + '-100'">
           <div class="p-3 border-b flex items-center justify-between rounded-t-xl" [ngClass]="'bg-' + color + '-50/50 border-' + color + '-100'">
              <h3 class="font-semibold text-sm flex items-center gap-2" [ngClass]="'text-' + color + '-900'">
                <div class="w-2 h-2 rounded-full" [ngClass]="'bg-' + color + '-500'"></div> {{ title }}
              </h3>
              <span class="text-xs bg-white px-2 py-0.5 rounded-full border text-slate-500" [ngClass]="'border-' + color + '-100'">{{ items.length }}</span>
           </div>
           <div class="p-3 space-y-3 overflow-y-auto flex-grow custom-scrollbar">
             @for (item of items; track item.idEnrollment) {
               <div class="bg-white p-3 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-all group relative">
                  <div class="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded p-0.5">
                     <button (click)="openEditModal(item.idEnrollment)" class="text-slate-400 hover:text-indigo-500 p-1" title="Edit">
                        <span [innerHTML]="Icons.edit | safeHtml"></span>
                     </button>
                     <button (click)="dataService.deleteEnrollment(item.idEnrollment)" class="text-slate-400 hover:text-red-500 p-1" title="Delete">
                        <span [innerHTML]="Icons.trash | safeHtml"></span>
                     </button>
                  </div>
                  
                  <h4 class="font-semibold text-slate-800 text-sm mb-1">
                    {{ item.student?.firstName }} {{ item.student?.lastName }}
                  </h4>
                  <p class="text-xs text-slate-500 mb-2">
                    {{ item.course?.name }}
                  </p>                  
                  <div class="pt-2 border-t border-slate-50 flex justify-between items-center">
                     <span class="text-[10px] text-slate-400">ID: {{item.idEnrollment}}</span>
                     <!-- Simple Status Toggle for Demo -->
                     <div class="flex gap-1">
                        @if(status !== 'COMPLETED') {
                             <button (click)="moveStatus(item.idEnrollment, 'COMPLETED')" class="w-4 h-4 rounded-full bg-green-100 hover:bg-green-200 text-green-600 flex items-center justify-center text-[10px]" title="Mark Complete">✓</button>
                        }
                        @if(status !== 'FAILED' && status !== 'COMPLETED') {
                             <button (click)="moveStatus(item.idEnrollment, 'FAILED')" class="w-4 h-4 rounded-full bg-red-100 hover:bg-red-200 text-red-600 flex items-center justify-center text-[10px]" title="Mark Failed">!</button>
                        }
                     </div>
                  </div>
               </div>
             }
           </div>
        </div>
    </ng-template>

    <!-- Modal -->
    @if (isModalOpen()) {
      <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div class="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl animate-scale-in">
            <h3 class="text-xl font-bold text-slate-900 mb-4">
              @if(editingId()) { Edit Enrollment } @else { New Enrollment }
            </h3>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Student</label>
                <select [(ngModel)]="formData.studentId" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                  @for (s of dataService.students(); track s.idStudent) {
                    <option [ngValue]="s.idStudent">{{ s.firstName }} {{ s.lastName }}</option>
                  }
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Course</label>
                <select [(ngModel)]="formData.courseId" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                   @for (c of dataService.courses(); track c.idCourse) {
                    <option [ngValue]="c.idCourse">{{ c.name }}</option>
                  }
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select [(ngModel)]="formData.status" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                  <option value="ACTIVE">Active</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="FAILED">Failed</option>
                  <option value="DROPPED">Dropped</option>
                  <option value="WITHDRAWN">Withdrawn</option>
                </select>
              </div>
            </div>

            <div class="flex justify-end gap-3 mt-6">
              <button (click)="isModalOpen.set(false)" class="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors text-sm font-medium">Cancel</button>
              <button (click)="saveEnrollment()" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
                @if(editingId()) { Update } @else { Enroll }
              </button>
            </div>
          </div>
        </div>
    }
  `
})
export class KanbanComponent { 
  dataService = inject(DataService);
  Icons = Icons;
  
  isModalOpen = signal(false);
  editingId = signal<number | null>(null);

  // Filtered lists
  activeEnrollments = computed(() => this.dataService.enrollments().filter(t => t.status === 'ACTIVE'));
  completedEnrollments = computed(() => this.dataService.enrollments().filter(t => t.status === 'COMPLETED'));
  failedEnrollments = computed(() => this.dataService.enrollments().filter(t => t.status === 'FAILED'));
  droppedEnrollments = computed(() => this.dataService.enrollments().filter(t => t.status === 'DROPPED'));
  withdrawnEnrollments = computed(() => this.dataService.enrollments().filter(t => t.status === 'WITHDRAWN'));

  formData = {
    studentId: 0,
    courseId: 0,
    status: 'ACTIVE' as EnrollmentStatus
  };

  openCreateModal() {
    this.editingId.set(null);
    this.formData = { studentId: 0, courseId: 0, status: 'ACTIVE' as EnrollmentStatus };
    this.isModalOpen.set(true);
  }

  async openEditModal(id: number) {
     const enrollment = await this.dataService.getEnrollment(id);
     if (enrollment) {
        this.formData = {
           studentId: enrollment.student?.idStudent || 0,
           courseId: enrollment.course?.idCourse || 0,
           status: enrollment.status
        };
        this.editingId.set(id);
        this.isModalOpen.set(true);
     }
  }

  saveEnrollment() {
  if (!this.formData.studentId || !this.formData.courseId) return;

  if (this.editingId()) {
    // Update
    const current = this.dataService.enrollments().find(e => e.idEnrollment === this.editingId());
    if(current) {
      const payload = {
        idEnrollment: current.idEnrollment,
        status: this.formData.status,
        student: { idStudent: this.formData.studentId }, // juste l'id
        course: { idCourse: this.formData.courseId },   // juste l'id
      };
      this.dataService.updateEnrollment(payload as any); // 'any' temporaire car backend accepte l'objet minimal
    }
  } else {
    // Add
    this.dataService.addEnrollment({
      studentId: this.formData.studentId,
      courseId: this.formData.courseId,
      status: this.formData.status
    });
  }

  this.isModalOpen.set(false);
}


  moveStatus(id: number, status: string) {
    this.dataService.updateEnrollmentStatus(id, status as EnrollmentStatus);
  }
}
