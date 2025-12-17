// src/models/dtos.ts
import { EnrollmentStatus } from './types';

export interface EnrollmentDTO {
  idEnrollment: number;
  enrollmentDate: string;
  grade: number | null;
  status: string;
  student: { idStudent: number; firstName: string; lastName: string };
  course: { idCourse: number; name: string };
}



export interface StudentDTO {
  idStudent: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  departmentName?: string;
  //enrollments: EnrollmentDTO[]; // ici on ajoute les enrollments
}
