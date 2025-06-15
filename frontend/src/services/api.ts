import axios from 'axios';
import type { AxiosInstance, AxiosError } from 'axios';
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  ShishaSession,
  CreateSessionRequest,
  SessionsResponse,
  ErrorResponse
} from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

class ApiClient {
  private api: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Load token from localStorage on initialization
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken) {
      this.setToken(storedToken);
    }

    // Request interceptor to add token to headers
    this.api.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors
    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ErrorResponse>) => {
        if (error.response?.status === 401) {
          // Clear token and redirect to login
          this.clearToken();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  }

  getToken(): string | null {
    return this.token;
  }

  // Auth endpoints
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/auth/register', data);
    this.setToken(response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    return response.data;
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/auth/login', data);
    this.setToken(response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    return response.data;
  }

  async logout() {
    this.clearToken();
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await this.api.post('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
  }

  // Session endpoints
  async getSessions(limit = 20, offset = 0): Promise<SessionsResponse> {
    const response = await this.api.get<SessionsResponse>('/sessions', {
      params: { limit, offset },
    });
    // Ensure response has the expected structure
    return {
      sessions: response.data?.sessions || [],
      total: response.data?.total || 0,
      limit: response.data?.limit || limit,
      offset: response.data?.offset || offset,
    };
  }

  async getSession(id: string): Promise<ShishaSession> {
    const response = await this.api.get<ShishaSession>(`/sessions/${id}`);
    return response.data;
  }

  async createSession(data: CreateSessionRequest): Promise<ShishaSession> {
    const response = await this.api.post<ShishaSession>('/sessions', data);
    return response.data;
  }

  async updateSession(id: string, data: Partial<CreateSessionRequest>): Promise<ShishaSession> {
    const response = await this.api.put<ShishaSession>(`/sessions/${id}`, data);
    return response.data;
  }

  async deleteSession(id: string): Promise<void> {
    await this.api.delete(`/sessions/${id}`);
  }
}

export const apiClient = new ApiClient();