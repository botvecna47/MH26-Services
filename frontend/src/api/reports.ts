/**
 * Reports API
 */
import { axiosClient } from './axiosClient';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export interface Report {
  id: string;
  reporterId: string;
  providerId: string;
  reason: string;
  details: string | null;
  attachments: any | null;
  status: string;
  adminNotes: string | null;
  createdAt: string;
  provider: {
    id: string;
    businessName: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  };
}

export const reportsApi = {
  reportProvider: async (providerId: string, data: {
    reason: string;
    details: string;
    attachments?: any;
  }): Promise<Report> => {
    const response = await axiosClient.post(`/reports/providers/${providerId}`, data);
    return response.data;
  },
};

// React Query hooks
export function useReportProvider() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ providerId, ...data }: { providerId: string; reason: string; details: string; attachments?: any }) =>
      reportsApi.reportProvider(providerId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}

