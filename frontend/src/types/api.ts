export interface User {
  id: string;
  user_id: string;
  display_name: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  display_name: string;
  bio?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Flavor {
  id: string;
  session_id: string;
  flavor_name: string;
  brand: string;
  created_at: string;
}

export interface Session {
  id: string;
  user_id: string;
  created_by: string;
  session_date: string;
  store_name: string;
  mix_name: string;
  flavors: Flavor[];
  notes?: string;
  order_details?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  message?: string;
}

export interface RegisterRequest {
  user_id: string;
  password: string;
  display_name: string;
}

export interface LoginRequest {
  user_id: string;
  password: string;
}

export interface CreateProfileRequest {
  display_name: string;
  bio?: string;
  avatar_url?: string;
}

export interface UpdateProfileRequest {
  display_name?: string;
  bio?: string;
  avatar_url?: string;
}

export interface CreateSessionRequest {
  session_date: string;
  store_name: string;
  mix_name: string;
  flavors: {
    flavor_name: string;
    brand: string;
  }[];
  notes?: string;
  order_details?: string;
}

export interface UpdateSessionRequest {
  session_date?: string;
  store_name?: string;
  mix_name?: string;
  notes?: string;
  order_details?: string;
}

export interface SessionsResponse {
  sessions: Session[];
  total: number;
  limit: number;
  offset: number;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface RequestPasswordResetRequest {
  user_id: string;
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
}

export interface ErrorResponse {
  error: string;
}