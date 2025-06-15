export interface User {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  message?: string;
}

export interface LoginRequest {
  user_id: string;
  password: string;
}

export interface RegisterRequest {
  user_id: string;
  password: string;
}

export interface SessionFlavor {
  id?: string;
  session_id?: string;
  flavor_name?: string;
  brand?: string;
  created_at?: string;
}

export interface ShishaSession {
  id: string;
  user_id: string;
  created_by: string;
  session_date: string;
  store_name: string;
  flavors: SessionFlavor[];
  notes?: string;
  order_details?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateSessionRequest {
  session_date: string;
  store_name: string;
  flavors: Omit<SessionFlavor, 'id' | 'session_id' | 'created_at'>[];
  notes?: string;
  order_details?: string;
}

export interface SessionsResponse {
  sessions: ShishaSession[];
  total: number;
  limit: number;
  offset: number;
}

export interface ErrorResponse {
  error: string;
}