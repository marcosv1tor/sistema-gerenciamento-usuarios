import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { ActivityQueryParams } from '@/types';

const activityKeys = {
  all: ['activities'] as const,
  lists: () => [...activityKeys.all, 'list'] as const,
  list: (params?: ActivityQueryParams) => [...activityKeys.lists(), params] as const,
};

export const useActivities = (params?: ActivityQueryParams) => {
  return useQuery({
    queryKey: activityKeys.list(params),
    queryFn: () => apiService.getActivities(params),
    staleTime: 30 * 1000, // 30 seconds
  });
};