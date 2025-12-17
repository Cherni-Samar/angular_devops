import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewState } from './models/types';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ProjectsComponent } from './components/projects/projects.component';
import { KanbanComponent } from './components/kanban/kanban.component';
import { AiToolsComponent } from './components/ai-tools/ai-tools.component';
import { DepartmentsComponent } from './components/departments/departments.component';
import { SafeHtmlPipe } from './pipes/safe-html.pipe';
import { Icons } from './services/icons';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    DashboardComponent, 
    ProjectsComponent, 
    KanbanComponent, 
    AiToolsComponent,
    DepartmentsComponent, 
    SafeHtmlPipe
  ],
  template: `
    <div class="flex h-screen bg-slate-50 font-sans text-slate-900">
      <!-- Sidebar -->
      <aside class="w-64 bg-slate-900 text-white flex flex-col flex-shrink-0 transition-all">
        <div class="p-6 border-b border-slate-800">
          <h1 class="text-xl font-bold tracking-tight flex items-center gap-2">
            <span class="text-indigo-400 text-2xl">❖</span> UniManager
          </h1>
        </div>
        
        <nav class="flex-1 p-4 space-y-2 overflow-y-auto">
          <button (click)="setView('dashboard')" 
                  class="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium"
                  [class]="currentView() === 'dashboard' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'">
            <span [innerHTML]="Icons.dashboard | safeHtml" class="w-5 h-5 flex-shrink-0"></span>
            Dashboard
          </button>

          <button (click)="setView('students')" 
                  class="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium"
                  [class]="currentView() === 'students' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'">
            <span [innerHTML]="Icons.students | safeHtml" class="w-5 h-5 flex-shrink-0"></span>
            Students
          </button>

          <button (click)="setView('enrollments')" 
                  class="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium"
                  [class]="currentView() === 'enrollments' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'">
             <span [innerHTML]="Icons.enrollments | safeHtml" class="w-5 h-5 flex-shrink-0"></span>
            Enrollments
          </button>

          <button (click)="setView('departments')" 
                  class="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium"
                  [class]="currentView() === 'departments' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'">
             <span [innerHTML]="Icons.departments | safeHtml" class="w-5 h-5 flex-shrink-0"></span>
            Departments
          </button>

          <div class="pt-4 mt-4 border-t border-slate-800">
            <p class="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Tools</p>
            <button (click)="setView('ai-advisor')" 
                    class="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium"
                    [class]="currentView() === 'ai-advisor' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'">
               <span [innerHTML]="Icons.ai | safeHtml" class="w-5 h-5 flex-shrink-0"></span>
              AI Advisor
            </button>
          </div>
        </nav>

        <div class="p-4 border-t border-slate-800">
           <div class="flex items-center gap-3 px-4 py-2">
              <div class="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs">AD</div>
              <div>
                <p class="text-sm font-medium">Admin User</p>
                <p class="text-xs text-slate-500">admin@university.edu</p>
              </div>
           </div>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 overflow-auto h-full">
        <header class="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-10">
           <div class="flex justify-between items-center">
              <h2 class="text-lg font-semibold text-slate-800 capitalize">{{ currentView().replace('-', ' ') }}</h2>
              <div class="flex items-center gap-4">
                 <button class="p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors relative">
                    <span [innerHTML]="Icons.user | safeHtml" class="w-5 h-5"></span>
                 </button>
              </div>
           </div>
        </header>

        <div class="p-8">
          @switch (currentView()) {
            @case ('dashboard') { <app-dashboard /> }
            @case ('students') { <app-students /> }
            @case ('enrollments') { <app-enrollments /> }
            @case ('departments') { <app-departments /> }
            @case ('ai-advisor') { <app-ai-tools /> }
          }
        </div>
      </main>
    </div>
  `
})
export class AppComponent {
  currentView = signal<ViewState>('dashboard');
  Icons = Icons;

  setView(view: ViewState) {
    this.currentView.set(view);
  }
}