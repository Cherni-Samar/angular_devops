import { Injectable } from '@angular/core';
import { GoogleGenAI } from "@google/genai";

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private ai: GoogleGenAI;
  private readonly MODEL_ID = 'gemini-2.5-flash';

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async generateAcademicAdvice(prompt: string): Promise<string> {
    try {
      const response = await this.ai.models.generateContent({
        model: this.MODEL_ID,
        contents: prompt,
        config: {
          systemInstruction: "You are an expert Academic Advisor for a university. Help with course selection, student performance analysis, and suggesting study paths. Keep tone professional and encouraging."
        }
      });
      return response.text || 'No response generated.';
    } catch (error) {
      console.error('AI Error:', error);
      return 'Sorry, I cannot access the academic database right now.';
    }
  }

  async suggestStudyPlan(studentName: string, completedCourses: string[]): Promise<string> {
     try {
      const prompt = `Create a study plan for student ${studentName} who has completed: ${completedCourses.join(', ')}. 
      Suggest 3 new topics/courses in JSON format: [{"title": "Course Title", "reason": "Why take this"}]`;
      
      const response = await this.ai.models.generateContent({
        model: this.MODEL_ID,
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });
      return response.text;
    } catch (error) {
      console.error('AI Error:', error);
      return '[]';
    }
  }
}