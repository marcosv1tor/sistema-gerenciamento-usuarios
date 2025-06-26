export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  USER = 'user',
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
  currentPassword?: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  adminUsers: number;
  regularUsers: number;
  newUsersThisMonth: number;
}

export interface QueryParams {
  page?: number;
  limit?: number;
  role?: UserRole;
  sortBy?: 'name' | 'createdAt' | 'email';
  order?: 'asc' | 'desc';
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  timestamp: string;
}

// Form validation types
export interface FormErrors {
  [key: string]: string | undefined;
}

// Loading states
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

// Auth context types
export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (data: UpdateUserData) => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
  googleLogin: (credential: string) => Promise<void>;
}

// Table column type
export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  header?: string;
  sortable?: boolean;
  render?: (item: T, index: number) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
}

// Modal types
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  className?: string;
}

// Button variants
export type ButtonVariant = 
  | 'primary' 
  | 'secondary' 
  | 'danger' 
  | 'success' 
  | 'outline' 
  | 'ghost';

export type ButtonSize = 'sm' | 'md' | 'lg';

// Alert types
export type AlertType = 'success' | 'danger' | 'warning' | 'info';

// Badge variants
export type BadgeVariant = 
  | 'primary' 
  | 'secondary' 
  | 'success' 
  | 'danger' 
  | 'warning'
  | 'info';


export enum ActivityType {
  LOGIN = 'login',
  LOGOUT = 'logout',
  USER_CREATED = 'user_created',
  USER_UPDATED = 'user_updated',
  USER_DELETED = 'user_deleted',
  PROFILE_UPDATED = 'profile_updated',
  PASSWORD_CHANGED = 'password_changed',
}

export interface Activity {
  id: string;
  type: ActivityType;
  description: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  userId: string;
  user: User;
  targetUserId?: string;
  targetUser?: User;
  createdAt: string;
}

export interface ActivityQueryParams {
  type?: ActivityType;
  userId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}