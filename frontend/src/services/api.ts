import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  User,
  AuthResponse,
  LoginCredentials,
  RegisterData,
  CreateUserData,
  UpdateUserData,
  PaginatedResponse,
  UserStats,
  QueryParams,
  ApiResponse,
  Activity,
  ActivityQueryParams,
} from '@/types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    console.log('API URL:', process.env.REACT_APP_API_URL); // Linha temporária para debug
    this.api = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token && token.trim()) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors
    this.api.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        return response;
      },
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          // window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/auth/register', data);
    return response.data;
  }

  async getProfile(): Promise<User> {
    const response = await this.api.get<User>('/auth/me'); // Corrigido: /auth/profile -> /auth/me
    return response.data;
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/auth/refresh', {
      refresh_token: refreshToken,
    });
    return response.data;
  }

  // User endpoints
  async getUsers(params?: QueryParams): Promise<PaginatedResponse<User>> {
    const response = await this.api.get<PaginatedResponse<User>>('/users', {
      params,
    });
    return response.data; // ✅ Correção
  }

  async getUserById(id: string): Promise<User> {
    const response = await this.api.get<User>(`/users/${id}`);
    return response.data;
  }

  async createUser(data: CreateUserData): Promise<User> {
    const response = await this.api.post<ApiResponse<User>>('/users', data);
    return response.data.data!;
  }

  async updateUser(id: string, data: UpdateUserData): Promise<User> {
    const response = await this.api.patch<ApiResponse<User>>(`/users/${id}`, data); // Corrigido: PUT -> PATCH
    return response.data.data!;
  }

  async updateProfile(data: UpdateUserData): Promise<User> {
    const response = await this.api.patch<User>('/users/me', data); // ← Mudar de ApiResponse<User> para User
    console.log('Data -------->', data)
    return response.data; // ← Remover o .data! extra
  }

  async deleteUser(id: string): Promise<void> {
    await this.api.delete(`/users/${id}`);
  }

  async getUserStats(): Promise<UserStats> {
    const response = await this.api.get<UserStats>('/users/stats');
    return response.data; // Removido o .data! extra
  }

  async getInactiveUsers(): Promise<User[]> {
    const response = await this.api.get<User[]>('/users/inactive');
    return response.data; 
  }

  // Utility methods - SIMPLIFICADOS para evitar duplicação
  setAuthToken(token: string): void {
  }

  removeAuthToken(): void {
    // O interceptor já cuida disso, não precisamos fazer nada aqui
    // Mantemos o método para compatibilidade
  }

  // Generic request method for custom endpoints
  async request<T = any>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    url: string,
    data?: any,
    config?: any
  ): Promise<T> {
    const response = await this.api.request<T>({
      method,
      url,
      data,
      ...config,
    });
    return response.data;
  }

  async googleLogin(credential: string) {
    const response = await this.api.post('/auth/google/verify', {
      credential,
    });
    return response.data;
  }

  // Activities
  async getActivities(params?: ActivityQueryParams): Promise<PaginatedResponse<Activity>> {
    const response = await this.api.get<PaginatedResponse<Activity>>('/activities', {
      params,
    });
    return response.data;
  }
}

// Create and export a singleton instance
export const apiService = new ApiService();
export default apiService;