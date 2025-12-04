import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ShiftsAPI } from "../api/endpoints";
import type { PaginatedResponse, Shift } from "../api/types";

const SHIFTS_QUERY_KEY = ["shifts"] as const;
const getShiftsQueryKey = (params?: UseShiftsParams) =>
  ["shifts", params ?? null] as const;

export interface UseShiftsParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  nurse_id?: string; // VARCHAR(100)
  facility_id?: string; // VARCHAR(50)
  date_from?: string;
  date_to?: string;
}

export function useShifts(params?: UseShiftsParams) {
  return useQuery<PaginatedResponse<Shift>>({
    queryKey: getShiftsQueryKey(params),
    queryFn: () => ShiftsAPI.listPaginated(params),
  });
}

export function useCreateShift() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Shift>) => ShiftsAPI.create(data),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: SHIFTS_QUERY_KEY }),
  });
}

export function useUpdateShift() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Shift> }) =>
      ShiftsAPI.update(id, data),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: SHIFTS_QUERY_KEY }),
  });
}

export function useDeleteShift() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => ShiftsAPI.remove(id),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: SHIFTS_QUERY_KEY }),
  });
}

