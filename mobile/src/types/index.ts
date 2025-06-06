// User types
export interface User {
  _id: string;
  username: string;
  email: string;
  role: 'user' | 'admin' | 'super_admin';
  createdAt: string;
  updatedAt: string;
}

// Lecture types
export interface Lecture {
  _id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  lecturer: string;
  organization?: string;
  daija?: string;
  image?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdBy: User;
  createdAt: string;
  updatedAt: string;
}

// Daija types
export interface Daija {
  _id: string;
  name: string;
  description: string;
  image?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdBy: User;
  createdAt: string;
  updatedAt: string;
}

// Organization types
export interface Organization {
  _id: string;
  name: string;
  description: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  image?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdBy: User;
  createdAt: string;
  updatedAt: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Navigation types
export type RootStackParamList = {
  Home: undefined;
  Lectures: undefined;
  LectureDetail: { lectureId: string };
  Daije: undefined;
  DaijaDetail: { daijaId: string };
  Organizations: undefined;
  OrganizationDetail: { organizationId: string };
  Profile: undefined;
  Login: undefined;
  Register: undefined;
};

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  securityQuestionIndex: number;
  securityAnswer: string;
}

export interface LectureForm {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  lecturer: string;
  organization?: string;
  daija?: string;
}

export interface DaijaForm {
  name: string;
  description: string;
}

export interface OrganizationForm {
  name: string;
  description: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
} 