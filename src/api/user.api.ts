import type { UserProfile } from './types';

import { useQuery } from '@tanstack/react-query';

import axiosInstance from 'src/lib/axios';

// ----------------------------------------------------------------------

export async function getMe(): Promise<UserProfile> {
  const { data } = await axiosInstance.get<UserProfile>('/api/v1/users/me');
  return data;
}

// ----------------------------------------------------------------------

export function useMe() {
  return useQuery({
    queryKey: ['users', 'me'],
    queryFn: getMe,
  });
}
