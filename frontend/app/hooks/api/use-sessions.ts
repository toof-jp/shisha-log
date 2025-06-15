import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '~/lib/api-client';
import type { Session, CreateSessionDto, UpdateSessionDto } from '~/types/api';

export function useSessions(limit = 20, offset = 0) {
  return useQuery({
    queryKey: ['sessions', limit, offset],
    queryFn: async () => {
      const { data } = await apiClient.get<Session[]>('/sessions', {
        params: { limit, offset },
      });
      return data;
    },
    retry: false,
    refetchOnWindowFocus: false,
  });
}

export function useSession(id: string) {
  return useQuery({
    queryKey: ['sessions', id],
    queryFn: async () => {
      const { data } = await apiClient.get<Session>(`/sessions/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (sessionData: CreateSessionDto) => {
      const { data } = await apiClient.post<Session>('/sessions', sessionData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
}

export function useUpdateSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateSessionDto }) => {
      const response = await apiClient.put(`/sessions/${id}`, data);
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['sessions', id] });
    },
  });
}

export function useDeleteSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/sessions/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
}