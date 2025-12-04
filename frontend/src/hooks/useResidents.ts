import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "../api/residents";
import type { Resident } from "../api/types";

const RESIDENTS_QUERY_KEY = ["residents"] as const;
const getResidentsQueryKey = (facilityId?: string) =>
  facilityId !== undefined
    ? [...RESIDENTS_QUERY_KEY, facilityId] as const
    : RESIDENTS_QUERY_KEY;

export function useResidents(facilityId?: string) {
  return useQuery<Resident[]>({
    queryKey: getResidentsQueryKey(facilityId),
    queryFn: () => api.getResidents(facilityId).then((res) => res.data),
  });
}

export function useResident(resident_id?: string) {
  return useQuery<Resident | null>({
    queryKey: ["resident", resident_id],
    queryFn: () =>
      resident_id ? api.getResidentById(resident_id).then((res) => res.data) : null,
    enabled: !!resident_id,
  });
}

export function useResidentOptions() {
  return useResidents();
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
    mutationFn: ({ resident_id, data }: { resident_id: string; data: Partial<Resident> }) =>
      api.updateResident(resident_id, data).then((res) => res.data),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: RESIDENTS_QUERY_KEY }),
  });
}

export function useDeleteResident() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (resident_id: string) => api.deleteResident(resident_id),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: RESIDENTS_QUERY_KEY }),
  });
}

