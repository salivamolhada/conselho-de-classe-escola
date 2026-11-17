export type UserRole = 'diretora' | 'professor';

export type RatingValue = 'otimo' | 'bom' | 'regular' | 'ruim';

export type ReportStatus = 'pendente' | 'rascunho' | 'enviado' | 'visto';

export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  password: string;
  role: UserRole;
  subject?: string;
  classes?: string[];
  createdAt: string;
}

export interface SchoolClass {
  id: string;
  name: string;
  shift: string;
  year: string;
  description?: string;
}

export interface Student {
  id: string;
  name: string;
  rollNumber: string;
  classGroup: string;
  status: 'ativo' | 'atencao' | 'transferido';
  notes?: string;
}

export interface Section {
  id: string;
  title: string;
  order: number;
}

export interface Question {
  id: string;
  sectionId: string;
  prompt: string;
  placeholder?: string;
  required: boolean;
  order: number;
}

export interface Dimension {
  id: string;
  name: string;
  description: string;
}

export interface StudentRatingEntry {
  rating: RatingValue;
  notes?: string;
}

export interface SignatureInfo {
  signed: boolean;
  signedBy?: string;
  signedAt?: string;
  notes?: string;
}

export interface Report {
  id: string;
  schoolName: string;
  schoolSubtitle: string;
  title: string;
  teacherId: string;
  teacherName: string;
  component: string;
  classGroup: string;
  date: string;
  bimester: string;
  status: ReportStatus;
  createdAt: string;
  updatedAt: string;
  answers: Record<string, string>;
  dimensionRatings?: Record<string, RatingValue>;
  studentRatings?: Record<string, StudentRatingEntry>;
  pedagogaSignature: SignatureInfo;
  diretoraSignature: SignatureInfo;
}

export type AppTab =
  | 'archive'
  | 'performance'
  | 'panorama'
  | 'students'
  | 'classes'
  | 'release'
  | 'teachers'
  | 'questions'
  | 'my-reports'
  | 'new-form';
