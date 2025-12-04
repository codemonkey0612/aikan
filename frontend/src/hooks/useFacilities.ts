import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "../api/facilities";
import type { Facility } from "../api/types";

const FACILITIES_QUERY_KEY = ["facilities"] as const;

export function useFacilities() {
  return useQuery<Facility[]>({
    queryKey: FACILITIES_QUERY_KEY,
    queryFn: () => api.getFacilities().then((res) => res.data),
  });
}

export function useCreateFacility() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Facility>) =>
      api.createFacility(data).then((res) => res.data),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: FACILITIES_QUERY_KEY }),
  });
}

export function useUpdateFacility() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Facility> }) =>
      api.updateFacility(id, data).then((res) => res.data),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: FACILITIES_QUERY_KEY }),
  });
}

export function useDeleteFacility() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.deleteFacility(id),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: FACILITIES_QUERY_KEY }),
  });
}

