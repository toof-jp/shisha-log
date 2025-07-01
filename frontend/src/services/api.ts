import axios from 'axios';
import type { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  ShishaSession,
  CreateSessionRequest,
  SessionsResponse,
  ErrorResponse,
  FlavorStats,
  CalendarData,
  SessionsByDateResponse,
  StoreStats,
  CreatorStats,
  OrderStats
} from '../types/api';

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/v1';

class ApiClient {
  private api: AxiosInstance;
  private token: string | null = null;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value: string | null) => void;
    reject: (reason: Error) => void;
  }> = [];

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true, // Send cookies with requests
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

    // Response interceptor to handle errors and token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ErrorResponse>) => {
        const originalRequest = error.config as CustomAxiosRequestConfig;

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // If already refreshing, queue this request
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            }).then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return this.api(originalRequest);
            }).catch((err) => {
              return Promise.reject(err);
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            // Try to refresh the token
            const response = await this.api.post<AuthResponse>('/auth/refresh');
            const { token, user } = response.data;

            // Update token and user
            this.setToken(token);
            localStorage.setItem('user', JSON.stringify(user));

            // Process queued requests
            this.processQueue(null, token);

            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return this.api(originalRequest);
          } catch (refreshError) {
            // Refresh failed, redirect to login
            const error = refreshError instanceof Error ? refreshError : new Error('Token refresh failed');
            this.processQueue(error, null);
            this.clearToken();
            window.location.href = '/login';
            return Promise.reject(error);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private processQueue(error: Error | null, token: string | null = null) {
    this.failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });
    
    this.failedQueue = [];
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
    try {
      await this.api.post('/auth/logout');
    } catch (error) {
      // Even if logout fails, clear local state
      console.error('Logout error:', error);
    } finally {
      this.clearToken();
    }
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

  // Flavor endpoints
  async getFlavorStats(): Promise<FlavorStats> {
    const response = await this.api.get<FlavorStats>('/flavors/stats');
    return response.data;
  }

  // Calendar endpoints
  async getCalendarData(year: number, month: number): Promise<CalendarData[]> {
    // Get user's timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    const response = await this.api.get<CalendarData[]>('/sessions/calendar', {
      params: { year, month, timezone },
    });
    return response.data;
  }

  async getSessionsByDate(date: string): Promise<SessionsByDateResponse> {
    // Get user's timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    const response = await this.api.get<SessionsByDateResponse>('/sessions/by-date', {
      params: { 
        date,
        timezone
      },
    });
    return response.data;
  }

  async getStoreStats(): Promise<StoreStats> {
    const response = await this.api.get<StoreStats>('/stores/stats');
    return response.data;
  }

  async getCreatorStats(): Promise<CreatorStats> {
    const response = await this.api.get<CreatorStats>('/creators/stats');
    return response.data;
  }

  async getOrderStats(): Promise<OrderStats> {
    const response = await this.api.get<OrderStats>('/orders/stats');
    return response.data;
  }
}

export const apiClient = new ApiClient();