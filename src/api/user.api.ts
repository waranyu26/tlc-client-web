import type { UserProfile } from './types';

import { useQuery } from '@tanstack/react-query';

import axiosInstance from 'src/lib/axios';

// ----------------------------------------------------------------------

export async function getMe(): Promise<UserProfile> {
  const { data } = await axiosInstance.get<UserProfile>('/api/v1/users/me');
  return data;
}

/**
 * Changes the display name. Name is the only profile field editable here —
 * the email moves through the auth module's confirm-first flow instead, and
 * role, status and balance are not the account holder's to set.
 */
export async function updateProfile(fullName: string): Promise<UserProfile> {
  const { data } = await axiosInstance.put<UserProfile>('/api/v1/users/me', {
    full_name: fullName,
  });
  return data;
}

// ----------------------------------------------------------------------

export function useMe() {
  return useQuery({
    queryKey: ['users', 'me'],
    queryFn: getMe,
  });
}
