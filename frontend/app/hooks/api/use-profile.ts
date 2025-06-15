import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '~/lib/api-client';
import type { Profile } from '~/types/api';

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data } = await apiClient.get<Profile>('/profile');
      return data;
    },
  });
}

export function useCreateProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (profileData: { display_name: string; bio?: string; avatar_url?: string }) => {
      const { data } = await apiClient.post<Profile>('/profile', profileData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (profileData: { display_name?: string; bio?: string; avatar_url?: string }) => {
      const { data } = await apiClient.put('/profile', profileData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}