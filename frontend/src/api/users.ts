/**
 * Users API Client
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { axiosClient } from './axiosClient';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  role: 'CUSTOMER' | 'PROVIDER' | 'ADMIN';
  emailVerified: boolean;
  phoneVerified: boolean;
  provider?: {
    id: string;
    businessName: string;
    status: string;
  };
}

export interface UpdateUserData {
  name?: string;
  phone?: string;
  avatarUrl?: string;
}

export interface AvatarUploadResponse {
  presignedUrl: string;
  key: string;
  url: string;
}

const usersApi = {
  getMe: async (): Promise<User> => {
    const response = await axiosClient.get<User>('/users/me');
    return response.data;
  },

  updateMe: async (data: UpdateUserData): Promise<User> => {
    const response = await axiosClient.patch<User>('/users/me', data);
    return response.data;
  },

  uploadAvatar: async (file: File): Promise<AvatarUploadResponse> => {
    // First, get presigned URL
    const { data: uploadData } = await axiosClient.post<AvatarUploadResponse>('/users/me/avatar', {
      filename: file.name,
      contentType: file.type,
    });

    // Upload file to S3 using presigned URL
    await fetch(uploadData.presignedUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });

    // Update user profile with new avatar URL
    await usersApi.updateMe({ avatarUrl: uploadData.url });

    return uploadData;
  },
};

// React Query hooks
export function useMe() {
  return useQuery({
    queryKey: ['user', 'me'],
    queryFn: () => usersApi.getMe(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useUpdateMe() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: UpdateUserData) => usersApi.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
    },
  });
}

export function useUploadAvatar() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (file: File) => usersApi.uploadAvatar(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
    },
  });
}

export default usersApi;

