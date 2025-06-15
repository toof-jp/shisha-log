export interface Profile {
  id: string;
  user_id: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  created_at: string;
  updated_at: string;
}

export interface Flavor {
  id?: string;
  session_id?: string;
  flavor_name: string;
  brand: string;
  created_at?: string;
}

export interface Session {
  id: string;
  user_id: string;
  created_by: string;
  session_date: string;
  store_name: string;
  notes?: string;
  order_details?: string;
  mix_name?: string;
  created_at: string;
  updated_at: string;
  flavors: Flavor[];
}

export interface CreateSessionDto {
  user_id: string;
  session_date: string;
  store_name: string;
  notes?: string;
  order_details?: string;
  mix_name?: string;
  flavors: Omit<Flavor, 'id' | 'session_id' | 'created_at'>[];
}

export interface UpdateSessionDto {
  session_date?: string;
  store_name?: string;
  notes?: string;
  order_details?: string;
  mix_name?: string;
}

export interface ApiError {
  error: string;
}