import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiService } from '../../services/ai.service';
import { DataService } from '../../services/data.service';
import { SafeHtmlPipe } from '../../pipes/safe-html.pipe';
import { Icons } from '../../services/icons';

@Component({
  selector: 'app-ai-tools',
  standalone: true,
  imports: [CommonModule, FormsModule, SafeHtmlPipe],
  template: `
    <div class="h-full flex flex-col gap-6">
       <div class="flex items-center gap-3">
         <div class="p-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg shadow-md">
           <span [innerHTML]="Icons.ai | safeHtml"></span>
         </div>
         <div>
            <h2 class="text-2xl font-bold text-slate-800">Academic Advisor AI</h2>
            <p class="text-slate-500 text-sm">Powered by Gemini 2.5 Flash</p>
         </div>
       </div>

       <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full min-h-0">
         
         <!-- Chat Section -->
         <div class="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden">
            <div class="p-4 border-b border-slate-100 bg-slate-50">
              <h3 class="font-semibold text-slate-800">Ask the Advisor</h3>
              <p class="text-xs text-slate-500">Ask about course prerequisites, career paths, or study tips.</p>
            </div>
            
            <div class="flex-grow p-4 overflow-y-auto space-y-4 bg-slate-50/30">
               @if (chatResponse()) {
                 <div class="flex gap-3">
                    <div class="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 text-purple-600 text-xs font-bold">AI</div>
                    <div class="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{{ chatResponse() }}</div>
                 </div>
               } @else {
                 <div class="h-full flex flex-col items-center justify-center text-slate-400 text-center p-8">
                    <span [innerHTML]="Icons.ai | safeHtml" class="opacity-20 w-16 h-16 mb-4"></span>
                    <p>I can help you analyze student performance and suggest improvements.</p>
                 </div>
               }
            </div>

            <div class="p-4 bg-white border-t border-slate-100">
               <div class="flex gap-2">
                 <input type="text" [(ngModel)]="prompt" (keyup.enter)="askAi()" 
                        placeholder="E.g., How to improve student retention in Java courses?" 
                        class="flex-grow px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm">
                 <button (click)="askAi()" [disabled]="isLoading()" 
                         class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                    @if (isLoading()) { 
                      <span class="animate-spin inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></span> 
                    } @else {
                      <span [innerHTML]="Icons.send | safeHtml"></span>
                    }
                 </button>
               </div>
            </div>
         </div>

         <!-- Study Plan Generator -->
         <div class="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden">
            <div class="p-4 border-b border-slate-100 bg-slate-50">
              <h3 class="font-semibold text-slate-800">Study Path Generator</h3>
              <p class="text-xs text-slate-500">Generate future course recommendations based on student history.</p>
            </div>

            <div class="p-6 flex flex-col gap-4">
               <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">Select Student</label>
                  <select [(ngModel)]="selectedStudentId" class="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-sm">
                    <option [ngValue]="null">-- Choose Student --</option>
                    @for(s of dataService.students(); track s.idStudent) {
                      <option [value]="s.idStudent">{{ s.firstName }} {{ s.lastName }}</option>
                    }
                  </select>
               </div>

               <button (click)="generatePlan()" [disabled]="!selectedStudentId || isGenerating()"
                       class="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm flex items-center justify-center gap-2">
                  @if (isGenerating()) {
                     <span class="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></span> Analyzing History...
                  } @else {
                     <span [innerHTML]="Icons.ai | safeHtml"></span> Suggest Next Courses
                  }
               </button>

               @if (generatedPlan.length > 0) {
                 <div class="mt-4 border-t border-slate-100 pt-4">
                    <h4 class="text-sm font-bold text-slate-800 mb-3">Recommended Path</h4>
                    <div class="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                       @for (item of generatedPlan; track $index) {
                         <div class="p-3 border border-purple-100 bg-purple-50/50 rounded-lg flex gap-3">
                            <div class="flex-grow">
                               <p class="text-sm font-bold text-purple-900">{{ item.title }}</p>
                               <p class="text-xs text-slate-600 mt-1">{{ item.reason }}</p>
                            </div>
                         </div>
                       }
                    </div>
                 </div>
               }
            </div>
         </div>

       </div>
    </div>
  `
})
export class AiToolsComponent {
  aiService = inject(AiService);
  dataService = inject(DataService);
  Icons = Icons;

  prompt = '';
  chatResponse = signal('');
  isLoading = signal(false);

  selectedStudentId: number | null = null;
  isGenerating = signal(false);
  generatedPlan: any[] = [];

  async askAi() {
    if (!this.prompt.trim()) return;
    this.isLoading.set(true);
    const response = await this.aiService.generateAcademicAdvice(this.prompt);
    this.chatResponse.set(response);
    this.isLoading.set(false);
    this.prompt = '';
  }

  async generatePlan() {
  if (!this.selectedStudentId) return;
  
  const student = this.dataService.students().find(s => s.idStudent == this.selectedStudentId);
  if (!student) return;

  // Find completed courses for context
  const completed = this.dataService.enrollments()
      .filter(e => e.student?.idStudent === this.selectedStudentId && e.status === 'COMPLETED')
      .map(e => e.course?.name || 'Unknown Course'); // <-- utiliser e.course.name

  this.isGenerating.set(true);

  try {
    const result = await this.aiService.suggestStudyPlan(student.firstName, completed);
    this.generatedPlan = JSON.parse(result);
  } catch (e) {
    console.error("Failed to parse JSON from AI", e);
    this.generatedPlan = [];
  } finally {
    this.isGenerating.set(false);
  }
}

}
