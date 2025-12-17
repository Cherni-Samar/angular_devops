import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
import { SafeHtmlPipe } from '../../pipes/safe-html.pipe';
import { Icons } from '../../services/icons';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, SafeHtmlPipe],
  template: `
    <div class="space-y-6 animate-fade-in">
      <h2 class="text-2xl font-bold text-slate-800">University Overview</h2>
      
      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Students Stat -->
        <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-slate-500">Total Students</p>
              <p class="text-3xl font-bold text-slate-900 mt-2">{{ dataService.totalStudents() }}</p>
            </div>
            <div class="bg-indigo-50 p-3 rounded-lg text-indigo-600">
              <span [innerHTML]="Icons.students | safeHtml"></span>
            </div>
          </div>
        </div>

        <!-- Enrollments Stat -->
        <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-slate-500">Active Enrollments</p>
              <p class="text-3xl font-bold text-slate-900 mt-2">{{ dataService.activeEnrollments() }}</p>
            </div>
            <div class="bg-green-50 p-3 rounded-lg text-green-600">
              <span [innerHTML]="Icons.check | safeHtml"></span>
            </div>
          </div>
        </div>

        <!-- Courses Stat -->
        <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-slate-500">Available Courses</p>
              <p class="text-3xl font-bold text-slate-900 mt-2">{{ dataService.courses().length }}</p>
            </div>
            <div class="bg-blue-50 p-3 rounded-lg text-blue-600">
              <span [innerHTML]="Icons.enrollments | safeHtml"></span>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Enrollments Table -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h3 class="font-semibold text-slate-800">Recent Enrollments</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm text-slate-600">
            <thead class="bg-slate-50 text-slate-900 font-medium">
              <tr>
                <th class="px-6 py-3">Student</th>
                <th class="px-6 py-3">Course</th>
                <th class="px-6 py-3">Date</th>
                <th class="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (enrollment of dataService.enrollments().slice(0, 5); track enrollment.idEnrollment) {
                <tr class="hover:bg-slate-50/50 transition-colors">
                  <td class="px-6 py-3 font-medium">
                    {{ enrollment.student?.firstName }} {{ enrollment.student?.lastName }}
                  </td>
                  <td class="px-6 py-3">
                    {{ enrollment.course?.name }}
                  </td>
                  <td class="px-6 py-3">
                    {{ enrollment.enrollmentDate | date:'shortDate' }}
                  </td>
                  <td class="px-6 py-3">
                    <span class="px-2 py-1 rounded-full text-xs font-medium"
                      [class]="getStatusClass(enrollment.status)">
                      {{ enrollment.status }}
                    </span>
                  </td>
                </tr>
              }
              @empty {
                <tr><td colspan="4" class="px-6 py-4 text-center text-slate-400">No active enrollments</td></tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent {
  dataService = inject(DataService);
  Icons = Icons;

  getStatusClass(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'bg-blue-100 text-blue-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      case 'DROPPED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  }
}
