import type { Address, DeliveryMethod, DeliveryRequest, MyDeliveryRequest } from './types';

import { useQuery, useMutation } from '@tanstack/react-query';

import axiosInstance from 'src/lib/axios';
import { queryClient } from 'src/lib/query-client';

// ----------------------------------------------------------------------

export type AddressInput = Omit<Address, 'id'>;

/**
 * Shipping needs an address; pickup needs the contact details the shop counter
 * checks before handing the card over. `method` is optional for the same reason
 * the API defaults it — a request without one is a shipment.
 */
export type DeliveryRequestInput = {
  card_id: string;
  method?: DeliveryMethod;
  address_id?: string;
  recipient_name?: string;
  phone?: string;
};

export async function getAddresses(): Promise<Address[]> {
  const { data } = await axiosInstance.get<Address[]>('/api/v1/delivery/addresses');
  return data;
}

export async function createAddress(body: AddressInput): Promise<Address> {
  const { data } = await axiosInstance.post<Address>('/api/v1/delivery/addresses', body);
  return data;
}

export async function updateAddress(id: string, body: AddressInput): Promise<Address> {
  const { data } = await axiosInstance.put<Address>(`/api/v1/delivery/addresses/${id}`, body);
  return data;
}

export async function deleteAddress(id: string): Promise<void> {
  await axiosInstance.delete(`/api/v1/delivery/addresses/${id}`);
}

export async function createDeliveryRequest(body: DeliveryRequestInput): Promise<DeliveryRequest> {
  const { data } = await axiosInstance.post<DeliveryRequest>('/api/v1/delivery/requests', body);
  return data;
}

/** The caller's own requests, pending and fulfilled, newest first. */
export async function getMyDeliveryRequests(): Promise<MyDeliveryRequest[]> {
  const { data } = await axiosInstance.get<MyDeliveryRequest[]>('/api/v1/delivery/requests');
  return data;
}

// ----------------------------------------------------------------------

export function useAddresses() {
  return useQuery({
    queryKey: ['delivery', 'addresses'],
    queryFn: getAddresses,
  });
}

export function useCreateAddressMutation() {
  return useMutation({
    mutationFn: createAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery', 'addresses'] });
    },
  });
}

export function useUpdateAddressMutation() {
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: AddressInput }) => updateAddress(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery', 'addresses'] });
    },
  });
}

export function useDeleteAddressMutation() {
  return useMutation({
    mutationFn: deleteAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery', 'addresses'] });
    },
  });
}

export function useMyDeliveryRequests() {
  return useQuery({
    queryKey: ['delivery', 'requests'],
    queryFn: getMyDeliveryRequests,
  });
}

export function useCreateDeliveryRequestMutation() {
  return useMutation({
    mutationFn: createDeliveryRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog', 'collection'] });
      queryClient.invalidateQueries({ queryKey: ['delivery', 'requests'] });
    },
  });
}
