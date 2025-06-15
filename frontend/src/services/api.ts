import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  Profile,
  CreateProfileRequest,
  UpdateProfileRequest,
  Session,
  CreateSessionRequest,
  UpdateSessionRequest,
  SessionsResponse,
  ChangePasswordRequest,
  RequestPasswordResetRequest,
  ResetPasswordRequest,
} from '@/types/api';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    // 環境変数から API ベース URL を取得、フォールバックは開発/本番で分岐
    const isDev = import.meta.env.DEV;
    const defaultBaseURL = isDev 
      ? 'https://localhost:8080/api/v1' 
      : 'https://api.shisha.toof.jp/api/v1';
    
    const baseURL = import.meta.env.VITE_API_BASE_URL || defaultBaseURL;
    
    this.api = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });

    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post('/auth/register', data);
    return response.data;
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post('/auth/login', data);
    return response.data;
  }

  async changePassword(data: ChangePasswordRequest): Promise<{ message: string }> {
    const response = await this.api.post('/auth/change-password', data);
    return response.data;
  }

  async requestPasswordReset(data: RequestPasswordResetRequest): Promise<{ message: string; reset_token?: string }> {
    const response = await this.api.post('/auth/request-password-reset', data);
    return response.data;
  }

  async resetPassword(data: ResetPasswordRequest): Promise<{ message: string }> {
    const response = await this.api.post('/auth/reset-password', data);
    return response.data;
  }

  async getProfile(): Promise<Profile> {
    const response: AxiosResponse<Profile> = await this.api.get('/profile');
    return response.data;
  }

  async createProfile(data: CreateProfileRequest): Promise<Profile> {
    const response: AxiosResponse<Profile> = await this.api.post('/profile', data);
    return response.data;
  }

  async updateProfile(data: UpdateProfileRequest): Promise<Profile> {
    const response: AxiosResponse<Profile> = await this.api.put('/profile', data);
    return response.data;
  }

  async getSessions(limit?: number, offset?: number): Promise<SessionsResponse> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());
    
    const response: AxiosResponse<SessionsResponse> = await this.api.get(`/sessions?${params}`);
    return response.data;
  }

  async getSession(id: string): Promise<Session> {
    const response: AxiosResponse<Session> = await this.api.get(`/sessions/${id}`);
    return response.data;
  }

  async createSession(data: CreateSessionRequest): Promise<Session> {
    const response: AxiosResponse<Session> = await this.api.post('/sessions', data);
    return response.data;
  }

  async updateSession(id: string, data: UpdateSessionRequest): Promise<Session> {
    const response: AxiosResponse<Session> = await this.api.put(`/sessions/${id}`, data);
    return response.data;
  }

  async deleteSession(id: string): Promise<{ message: string }> {
    const response = await this.api.delete(`/sessions/${id}`);
    return response.data;
  }
}

export const apiService = new ApiService();