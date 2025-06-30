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
  flavor_order?: number;
  created_at?: string;
}

export interface FlavorCount {
  flavor_name: string;
  count: number;
}

export interface FlavorStats {
  main_flavors: FlavorCount[];
  all_flavors: FlavorCount[];
}

export interface ShishaSession {
  id: string;
  user_id: string;
  created_by: string;
  session_date: string;
  store_name?: string;
  mix_name?: string;
  creator?: string;
  flavors?: SessionFlavor[];
  notes?: string;
  order_details?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateSessionRequest {
  session_date: string;
  store_name?: string;
  mix_name?: string;
  creator?: string;
  flavors?: Omit<SessionFlavor, 'id' | 'session_id' | 'created_at'>[];
  notes?: string;
  order_details?: string;
}

export interface SessionsResponse {
  sessions: ShishaSession[];
  total: number;
  limit: number;
  offset: number;
}

export interface CalendarData {
  date: string;
  count: number;
}

export interface SessionsByDateResponse {
  sessions: ShishaSession[];
  date: string;
}

export interface ErrorResponse {
  error: string;
}

export interface StoreCount {
  store_name: string;
  count: number;
}

export interface CreatorCount {
  creator: string;
  count: number;
}

export interface StoreStats {
  stores: StoreCount[];
}


export interface CreatorStats {
  creators: CreatorCount[];
}

export interface OrderCount {
  order_details: string;
  count: number;
}

export interface OrderStats {
  orders: OrderCount[];
}
