import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "../api/facilityShiftRequests";
import type { FacilityShiftRequest } from "../api/types";

const FACILITY_SHIFT_REQUESTS_QUERY_KEY = ["facility-shift-requests"] as const;

export function useFacilityShiftRequests(filters?: {
  facility_id?: string;
  year_month?: string;
  status?: "draft" | "submitted" | "scheduled";
}) {
  return useQuery<FacilityShiftRequest[]>({
    queryKey: [...FACILITY_SHIFT_REQUESTS_QUERY_KEY, filters],
    queryFn: () =>
      api.getFacilityShiftRequests(filters).then((res) => res.data),
  });
}

export function useFacilityShiftRequest(id: number) {
  return useQuery<FacilityShiftRequest>({
    queryKey: [...FACILITY_SHIFT_REQUESTS_QUERY_KEY, id],
    queryFn: () => api.getFacilityShiftRequestById(id).then((res) => res.data),
    enabled: !!id,
  });
}

export function useFacilityShiftRequestByFacilityAndMonth(
  facility_id: string,
  year_month: string
) {
  return useQuery<FacilityShiftRequest | null>({
    queryKey: [...FACILITY_SHIFT_REQUESTS_QUERY_KEY, facility_id, year_month],
    queryFn: () =>
      api
        .getFacilityShiftRequestByFacilityAndMonth(facility_id, year_month)
        .then((res) => res.data),
    enabled: !!facility_id && !!year_month,
  });
}

export function useCreateFacilityShiftRequest() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<FacilityShiftRequest>) =>
      api.createFacilityShiftRequest(data).then((res) => res.data),
    onSuccess: () =>
      client.invalidateQueries({
        queryKey: FACILITY_SHIFT_REQUESTS_QUERY_KEY,
      }),
  });
}

export function useUpdateFacilityShiftRequest() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<FacilityShiftRequest>;
    }) =>
      api.updateFacilityShiftRequest(id, data).then((res) => res.data),
    onSuccess: () =>
      client.invalidateQueries({
        queryKey: FACILITY_SHIFT_REQUESTS_QUERY_KEY,
      }),
  });
}

export function useDeleteFacilityShiftRequest() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api.deleteFacilityShiftRequest(id),
    onSuccess: () =>
      client.invalidateQueries({
        queryKey: FACILITY_SHIFT_REQUESTS_QUERY_KEY,
      }),
  });
}

