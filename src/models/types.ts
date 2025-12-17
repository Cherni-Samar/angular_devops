// ================= ENUMS =================
export enum EnrollmentStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  DROPPED = 'DROPPED',
  FAILED = 'FAILED',
  WITHDRAWN = 'WITHDRAWN'
}

// ================= DEPARTMENT =================
export interface Department {
  idDepartment: number;
  name: string;
  location?: string;
  phone?: string;
  head?: string;
}

// ================= STUDENT =================
export interface Student {
  idStudent: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  department?: Department;
  enrollments?: {
    idEnrollment: number;
    enrollmentDate: string;
    grade: number | null;
    status: EnrollmentStatus;
    course?: { idCourse: number; name: string };
  }[];
}


// ================= COURSE =================
export interface Course {
  idCourse: number;
  name: string;
  code?: string;
  credit?: number;
  description?: string;
}

// ================= ENROLLMENT =================
export interface Enrollment {
  idEnrollment: number;
  enrollmentDate: string;
  grade?: number | null;
  status: EnrollmentStatus;

  student?: Student;

  // 🔹 le backend n’envoie PAS course
  course?: Course;

  // 🔹 id du cours venant indirectement
  courseId?: number;

  // UI
  studentName?: string;
  courseTitle?: string;
}


// ================= VIEW STATE (UI) =================
export type ViewState = 'dashboard' | 'students' | 'enrollments' | 'departments' | 'ai-advisor';
