import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { VitalsAPI } from "../api/endpoints";
import type { PaginatedResponse, VitalRecord } from "../api/types";

const VITALS_QUERY_KEY = ["vitals"] as const;
const getVitalsQueryKey = (params?: UseVitalsParams) =>
  ["vitals", params ?? null] as const;

export interface UseVitalsParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  resident_id?: string;
  measured_from?: string;
  measured_to?: string;
  created_by?: number;
}

export function useVitals(params?: UseVitalsParams) {
  return useQuery<PaginatedResponse<VitalRecord>>({
    queryKey: getVitalsQueryKey(params),
    queryFn: () => VitalsAPI.listPaginated(params),
  });
}

export function useCreateVital() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<VitalRecord>) => VitalsAPI.create(data),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: VITALS_QUERY_KEY }),
  });
}

export function useUpdateVital() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<VitalRecord> }) =>
      VitalsAPI.update(id, data),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: VITALS_QUERY_KEY }),
  });
}

export function useDeleteVital() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => VitalsAPI.remove(id),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: VITALS_QUERY_KEY }),
  });
}

