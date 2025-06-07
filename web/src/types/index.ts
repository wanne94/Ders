// Common types used across the application

// User types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  name: string; // computed from firstName + lastName
  role: 'admin' | 'user' | 'superadmin';
  organization?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Lecture types
export interface Lecture {
  id: string;
  title: string;
  description: string;
  content: string;
  creator: string | User;
  organization?: string;
  isPublic: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Organization types
export interface Organization {
  id: string;
  name: string;
  description?: string;
  members: string[] | User[];
  admins: string[] | User[];
  createdAt: Date;
  updatedAt: Date;
}

// Daija types
export interface Daija {
  id: string;
  title: string;
  content: string;
  creator: string | User;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Suggestion types
export interface Suggestion {
  id: string;
  title: string;
  description: string;
  creator: string | User;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

// Settings types
export interface Settings {
  id: string;
  key: string;
  value: any;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Pagination types
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}

export interface LectureForm {
  title: string;
  description: string;
  content: string;
  isPublic: boolean;
  tags: string[];
}

// Component props types
export interface ComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// Navigation types
export interface NavItem {
  label: string;
  href: string;
  icon?: React.ComponentType;
  requiresAuth?: boolean;
  roles?: User['role'][];
}

// Theme types
export interface ThemeConfig {
  mode: 'light' | 'dark';
  primaryColor: string;
  secondaryColor: string;
}

// Upload types
export interface UploadedFile {
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: Date;
}

// Error types
export interface AppError {
  message: string;
  code?: string;
  statusCode?: number;
  details?: any;
}

// Loading states
export interface LoadingState {
  isLoading: boolean;
  error?: AppError | null;
}

// Search types
export interface SearchParams {
  query: string;
  filters?: Record<string, any>;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Modal types
export interface ModalProps extends ComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
} 