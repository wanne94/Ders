// User types
export interface IUser {
  _id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin' | 'superadmin';
  organization?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Lecture types
export interface ILecture {
  _id: string;
  title: string;
  description: string;
  content: string;
  creator: string | IUser;
  organization?: string;
  isPublic: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Organization types
export interface IOrganization {
  _id: string;
  name: string;
  description?: string;
  members: string[] | IUser[];
  admins: string[] | IUser[];
  createdAt: Date;
  updatedAt: Date;
}

// Daija types
export interface IDaija {
  _id: string;
  title: string;
  content: string;
  creator: string | IUser;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Suggestion types
export interface ISuggestion {
  _id: string;
  title: string;
  description: string;
  creator: string | IUser;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

// Settings types
export interface ISettings {
  _id: string;
  key: string;
  value: any;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// JWT Payload types
export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

// Request types
export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

// Upload types
export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  destination: string;
  filename: string;
  path: string;
  size: number;
} 