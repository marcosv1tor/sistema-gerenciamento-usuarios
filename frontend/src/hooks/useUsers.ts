import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import {
  User,
  PaginatedResponse,
  CreateUserData,
  UpdateUserData,
  QueryParams,
  UserStats,
} from '@/types';
import toast from 'react-hot-toast';

// Query keys
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (params: QueryParams) => [...userKeys.lists(), params] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
  stats: () => [...userKeys.all, 'stats'] as const,
  inactive: () => [...userKeys.all, 'inactive'] as const,
};

// Get paginated users
export const useUsers = (params?: QueryParams) => {
  return useQuery({
    queryKey: userKeys.list(params || {}),
    queryFn: () => apiService.getUsers(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get user by ID
export const useUser = (id: string) => {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => apiService.getUserById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get user statistics
export const useUserStats = () => {
  return useQuery({
    queryKey: userKeys.stats(),
    queryFn: () => apiService.getUserStats(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Get inactive users
export const useInactiveUsers = () => {
  return useQuery({
    queryKey: userKeys.inactive(),
    queryFn: () => apiService.getInactiveUsers(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Create user mutation
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserData) => apiService.createUser(data),
    onSuccess: (newUser) => {
      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.stats() });
      
      toast.success('Usuário criado com sucesso!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erro ao criar usuário';
      toast.error(message);
    },
  });
};

// Update user mutation
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserData }) =>
      apiService.updateUser(id, data),
    onSuccess: (updatedUser, { id }) => {
      // Invalidate the specific user detail query to force refetch
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
      
      // Invalidate lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.stats() });
      
      toast.success('Usuário atualizado com sucesso!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erro ao atualizar usuário';
      toast.error(message);
    },
  });
};

// Delete user mutation
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiService.deleteUser(id),
    onSuccess: (_, deletedId) => {
      // Remove the user from cache
      queryClient.removeQueries({ queryKey: userKeys.detail(deletedId) });
      
      // Invalidate lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.stats() });
      queryClient.invalidateQueries({ queryKey: userKeys.inactive() });
      
      toast.success('Usuário removido com sucesso!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erro ao remover usuário';
      toast.error(message);
    },
  });
};

// Prefetch user details
export const usePrefetchUser = () => {
  const queryClient = useQueryClient();

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: userKeys.detail(id),
      queryFn: () => apiService.getUserById(id),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };
};

// Custom hook for optimistic updates
export const useOptimisticUserUpdate = () => {
  const queryClient = useQueryClient();

  const updateUserOptimistically = (id: string, updates: Partial<User>) => {
    queryClient.setQueryData(userKeys.detail(id), (oldData: User | undefined) => {
      if (!oldData) return oldData;
      return { ...oldData, ...updates };
    });
  };

  const revertOptimisticUpdate = (id: string) => {
    queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
  };

  return {
    updateUserOptimistically,
    revertOptimisticUpdate,
  };
};