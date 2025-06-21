import axios from 'axios';
import type { AxiosInstance, AxiosError } from 'axios';
import type { paths, components } from '../../app/types/generated';

// Type helpers for extracting request/response types
type PathMethod<P extends keyof paths, M extends keyof paths[P]> = paths[P][M];
type RequestBody<P extends keyof paths, M extends keyof paths[P]> = 
  PathMethod<P, M> extends { requestBody: { content: { 'application/json': infer R } } } ? R : never;
type ResponseBody<P extends keyof paths, M extends keyof paths[P], S extends number = 200> = 
  PathMethod<P, M> extends { responses: { [K in S]: { content: { 'application/json': infer R } } } } ? R : never;
type QueryParams<P extends keyof paths, M extends keyof paths[P]> = 
  PathMethod<P, M> extends { parameters: { query?: infer Q } } ? Q : never;

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/v1';

export class TypedApiClient {
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
      (error: AxiosError<{ error?: string }>) => {
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
  async register(data: RequestBody<'/auth/register', 'post'>): Promise<ResponseBody<'/auth/register', 'post', 201>> {
    const response = await this.api.post<ResponseBody<'/auth/register', 'post', 201>>('/auth/register', data);
    if (response.data.token) {
      this.setToken(response.data.token);
    }
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  }

  async login(data: RequestBody<'/auth/login', 'post'>): Promise<ResponseBody<'/auth/login', 'post'>> {
    const response = await this.api.post<ResponseBody<'/auth/login', 'post'>>('/auth/login', data);
    if (response.data.token) {
      this.setToken(response.data.token);
    }
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  }

  async logout() {
    this.clearToken();
  }

  async changePassword(data: RequestBody<'/auth/change-password', 'post'>): Promise<ResponseBody<'/auth/change-password', 'post'>> {
    const response = await this.api.post<ResponseBody<'/auth/change-password', 'post'>>('/auth/change-password', data);
    return response.data;
  }

  async requestPasswordReset(data: RequestBody<'/auth/request-password-reset', 'post'>): Promise<ResponseBody<'/auth/request-password-reset', 'post'>> {
    const response = await this.api.post<ResponseBody<'/auth/request-password-reset', 'post'>>('/auth/request-password-reset', data);
    return response.data;
  }

  async resetPassword(data: RequestBody<'/auth/reset-password', 'post'>): Promise<ResponseBody<'/auth/reset-password', 'post'>> {
    const response = await this.api.post<ResponseBody<'/auth/reset-password', 'post'>>('/auth/reset-password', data);
    return response.data;
  }

  // User endpoints
  async getCurrentUser(): Promise<components['schemas']['models.User']> {
    const response = await this.api.get<components['schemas']['models.User']>('/users/me');
    return response.data;
  }

  // Session endpoints
  async getSessions(params?: QueryParams<'/sessions', 'get'>): Promise<ResponseBody<'/sessions', 'get'>> {
    const response = await this.api.get<ResponseBody<'/sessions', 'get'>>('/sessions', { params });
    return response.data;
  }

  async getSession(id: string): Promise<components['schemas']['models.SessionWithFlavors']> {
    const response = await this.api.get<components['schemas']['models.SessionWithFlavors']>(`/sessions/${id}`);
    return response.data;
  }

  async createSession(data: components['schemas']['models.CreateSessionRequest']): Promise<components['schemas']['models.SessionWithFlavors']> {
    const response = await this.api.post<components['schemas']['models.SessionWithFlavors']>('/sessions', data);
    return response.data;
  }

  async updateSession(id: string, data: components['schemas']['models.UpdateSessionRequest']): Promise<components['schemas']['models.SessionWithFlavors']> {
    const response = await this.api.put<components['schemas']['models.SessionWithFlavors']>(`/sessions/${id}`, data);
    return response.data;
  }

  async deleteSession(id: string): Promise<ResponseBody<'/sessions/{id}', 'delete'>> {
    const response = await this.api.delete<ResponseBody<'/sessions/{id}', 'delete'>>(`/sessions/${id}`);
    return response.data;
  }

  // Calendar endpoints
  async getCalendarData(params: QueryParams<'/sessions/calendar', 'get'>): Promise<ResponseBody<'/sessions/calendar', 'get'>> {
    // Add user's timezone if not provided
    const paramsWithTimezone = {
      ...params,
      timezone: params?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
    
    const response = await this.api.get<ResponseBody<'/sessions/calendar', 'get'>>('/sessions/calendar', { 
      params: paramsWithTimezone 
    });
    return response.data;
  }

  async getSessionsByDate(params: QueryParams<'/sessions/by-date', 'get'>): Promise<ResponseBody<'/sessions/by-date', 'get'>> {
    // Add user's timezone if not provided
    const paramsWithTimezone = {
      ...params,
      timezone: params?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
    
    const response = await this.api.get<ResponseBody<'/sessions/by-date', 'get'>>('/sessions/by-date', { 
      params: paramsWithTimezone 
    });
    return response.data;
  }

  // Statistics endpoints
  async getFlavorStats(): Promise<components['schemas']['models.FlavorStats']> {
    const response = await this.api.get<components['schemas']['models.FlavorStats']>('/flavors/stats');
    return response.data;
  }

  async getStoreStats(): Promise<components['schemas']['models.StoreStats']> {
    const response = await this.api.get<components['schemas']['models.StoreStats']>('/stores/stats');
    return response.data;
  }

  async getCreatorStats(): Promise<components['schemas']['models.CreatorStats']> {
    const response = await this.api.get<components['schemas']['models.CreatorStats']>('/creators/stats');
    return response.data;
  }
}

export const typedApiClient = new TypedApiClient();