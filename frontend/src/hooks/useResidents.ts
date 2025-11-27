import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "../api/residents";
import type { Resident } from "../api/types";

const RESIDENTS_QUERY_KEY = ["residents"] as const;
const getResidentsQueryKey = (facilityId?: number) =>
  facilityId !== undefined
    ? [...RESIDENTS_QUERY_KEY, facilityId] as const
    : RESIDENTS_QUERY_KEY;

export function useResidents(facilityId?: number) {
  return useQuery<Resident[]>({
    queryKey: getResidentsQueryKey(facilityId),
    queryFn: () => api.getResidents(facilityId).then((res) => res.data),
  });
}

export function useResident(id?: number) {
  return useQuery<Resident | null>({
    queryKey: ["resident", id],
    queryFn: () =>
      id ? api.getResidentById(id).then((res) => res.data) : null,
    enabled: !!id,
  });
}

export function useCreateResident() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Resident>) =>
      api.createResident(data).then((res) => res.data),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: RESIDENTS_QUERY_KEY }),
  });
}

export function useUpdateResident() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Resident> }) =>
      api.updateResident(id, data).then((res) => res.data),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: RESIDENTS_QUERY_KEY }),
  });
}

export function useDeleteResident() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api.deleteResident(id),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: RESIDENTS_QUERY_KEY }),
  });
}

