import { apiClient } from './api-client';

export interface User {
  id: string;
  username: string;
  created_at: string;
  updated_at: string;
}

export async function getCurrentUser(): Promise<User> {
  const { data } = await apiClient.get<User>('/users/me');
  return data;
}