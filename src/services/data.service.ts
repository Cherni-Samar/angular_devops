import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Student, Enrollment, Course, EnrollmentStatus, Department } from '../models/types';
import { EnrollmentDTO } from '../models/dtos';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private http = inject(HttpClient);

  // State Signals
  readonly students = signal<Student[]>([]);
  readonly enrollments = signal<EnrollmentDTO[]>([]); // DTO pour affichage
  readonly departments = signal<Department[]>([]);
  readonly courses = signal<Course[]>([]);

  // Computed Stats
  readonly totalStudents = computed(() => this.students().length);
  readonly totalEnrollments = computed(() => this.enrollments().length);
  readonly activeEnrollments = computed(() =>
    this.enrollments().filter(e => e.status === EnrollmentStatus.ACTIVE).length
  );
  readonly totalDepartments = computed(() => this.departments().length);
  readonly totalCourses = computed(() => this.courses().length);

  // Configuration
  private readonly API_URL = 'http://localhost:8089';
  private readonly httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
  private readonly httpTextOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }), responseType: 'text' as const };

  constructor() {
    this.loadInitialData();
  }

  // ================= INITIAL DATA =================
  async loadInitialData() {
    await this.fetchDepartments();
    await this.fetchCourses();
    await this.fetchStudents();
    await this.fetchEnrollments(); // hydrate DTO pour affichage
  }

  // ================= STUDENTS =================
  async fetchStudents() {
  try {
    const students = await firstValueFrom(
      this.http.get<Student[]>(`${this.API_URL}/student/students/getAllStudents`, this.httpOptions)
    );
    this.students.set(students);
  } catch (e) {
    console.error('Error fetching students', e);
  }
}
  async getStudent(id: number) {
    return firstValueFrom(this.http.get<Student>(`${this.API_URL}/student/students/getStudent/${id}`, this.httpOptions));
  }

  async addStudent(studentData: Partial<Student> & { departmentId?: number }) {
    const payload: any = { ...studentData };
    if (studentData.departmentId) payload.department = { idDepartment: studentData.departmentId };
    await firstValueFrom(this.http.post<Student>(`${this.API_URL}/student/students/createStudent`, payload, this.httpOptions));
    await this.fetchStudents();
  }

  async updateStudent(studentData: Partial<Student> & { departmentId?: number }) {
    const payload: any = { ...studentData };
    if (studentData.departmentId) payload.department = { idDepartment: studentData.departmentId };
    await firstValueFrom(this.http.put<Student>(`${this.API_URL}/student/students/updateStudent`, payload, this.httpOptions));
    await this.fetchStudents();
  }

  async deleteStudent(id: number) {
    await firstValueFrom(this.http.delete(`${this.API_URL}/student/students/deleteStudent/${id}`, this.httpOptions));
    this.students.update(s => s.filter(x => x.idStudent !== id));
  }

  // ================= ENROLLMENTS =================
  // Fetch DTO uniquement pour affichage
  async fetchEnrollments() {
    try {
      const response = await firstValueFrom(
        this.http.get(`${this.API_URL}/student/Enrollment/getAllEnrollment`, this.httpTextOptions)
      );
      const enrollments = JSON.parse(response) as EnrollmentDTO[];
      this.enrollments.set(enrollments);
    } catch (e) {
      console.error('Error fetching enrollments', e);
    }
  }

  async getEnrollment(id: number) {
    return firstValueFrom(this.http.get<Enrollment>(`${this.API_URL}/student/Enrollment/getEnrollment/${id}`, this.httpOptions));
  }

  async addEnrollment(data: { studentId: number; courseId: number; status: EnrollmentStatus }) {
    const payload = {
      student: { idStudent: data.studentId },
      course: { idCourse: data.courseId },
      status: data.status,
      enrollmentDate: new Date().toISOString()
    };
    await firstValueFrom(this.http.post<Enrollment>(`${this.API_URL}/student/Enrollment/createEnrollment`, payload, this.httpOptions));
    await this.fetchEnrollments();
  }

  async updateEnrollment(enrollment: Enrollment) {
    await firstValueFrom(this.http.put(`${this.API_URL}/student/Enrollment/updateEnrollment`, enrollment, this.httpOptions));
    await this.fetchEnrollments();
  }

  async updateEnrollmentStatus(id: number, status: EnrollmentStatus) {
    const enrollment = await this.getEnrollment(id);
    if (enrollment) {
      enrollment.status = status;
      await this.updateEnrollment(enrollment);
    }
  }

  async deleteEnrollment(id: number) {
    await firstValueFrom(this.http.delete(`${this.API_URL}/student/Enrollment/deleteEnrollment/${id}`, this.httpOptions));
    this.enrollments.update(e => e.filter(x => x.idEnrollment !== id));
  }

  // ================= DEPARTMENTS =================
  async fetchDepartments() {
    try {
      const depts = await firstValueFrom(this.http.get<Department[]>(`${this.API_URL}/student/Department/getAllDepartment`, this.httpOptions));
      this.departments.set(depts);
    } catch (e) { console.error('Error fetching departments', e); }
  }

  async getDepartment(id: number) {
    return firstValueFrom(this.http.get<Department>(`${this.API_URL}/student/Department/getDepartment/${id}`, this.httpOptions));
  }

  async addDepartment(dept: Omit<Department, 'idDepartment'>) {
    const saved = await firstValueFrom(this.http.post<Department>(`${this.API_URL}/student/Department/createDepartment`, dept, this.httpOptions));
    this.departments.update(d => [...d, saved]);
  }

  async updateDepartment(dept: Department) {
    await firstValueFrom(this.http.put(`${this.API_URL}/student/Department/updateDepartment`, dept, this.httpOptions));
    this.departments.update(d => d.map(x => x.idDepartment === dept.idDepartment ? dept : x));
  }

  async deleteDepartment(id: number) {
    await firstValueFrom(this.http.delete(`${this.API_URL}/student/Department/deleteDepartment/${id}`, this.httpOptions));
    this.departments.update(d => d.filter(x => x.idDepartment !== id));
  }

  // ================= COURSES =================
 async fetchCourses() {
  try {
    const courses = await firstValueFrom(
      this.http.get<Course[]>(`${this.API_URL}/student/courses/getAllCourses`, this.httpOptions)
    );
    this.courses.set(courses);
  } catch (e) {
    console.error('Error fetching courses', e);
  }
}

  async getCourse(id: number) {
    return firstValueFrom(this.http.get<Course>(`${this.API_URL}/student/courses/getCourse/${id}`, this.httpOptions));
  }

  async addCourse(course: Partial<Course>) {
    await firstValueFrom(this.http.post<Course>(`${this.API_URL}/student/courses/createCourse`, course, this.httpOptions));
    await this.fetchCourses();
  }

  async updateCourse(id: number, course: Partial<Course>) {
    course.idCourse = id;
    await firstValueFrom(this.http.put<Course>(`${this.API_URL}/student/courses/updateCourse/${id}`, course, this.httpOptions));
    await this.fetchCourses();
  }

  async deleteCourse(id: number) {
    await firstValueFrom(this.http.delete(`${this.API_URL}/student/courses/deleteCourse/${id}`, this.httpOptions));
    this.courses.update(c => c.filter(x => x.idCourse !== id));
  }
}
