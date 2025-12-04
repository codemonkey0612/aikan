import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { VisitsAPI } from "../api/endpoints";
import type { PaginatedResponse, Visit } from "../api/types";

const VISITS_QUERY_KEY = ["visits"] as const;
const getVisitsQueryKey = (params?: UseVisitsParams) =>
  ["visits", params ?? null] as const;

export interface UseVisitsParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  shift_id?: number;
  resident_id?: string;
  visited_from?: string;
  visited_to?: string;
}

export function useVisits(params?: UseVisitsParams) {
  return useQuery<PaginatedResponse<Visit>>({
    queryKey: getVisitsQueryKey(params),
    queryFn: () => VisitsAPI.listPaginated(params),
  });
}

export function useCreateVisit() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Visit>) => VisitsAPI.create(data),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: VISITS_QUERY_KEY }),
  });
}

export function useUpdateVisit() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Visit> }) =>
      VisitsAPI.update(id, data),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: VISITS_QUERY_KEY }),
  });
}

export function useDeleteVisit() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => VisitsAPI.remove(id),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: VISITS_QUERY_KEY }),
  });
}

