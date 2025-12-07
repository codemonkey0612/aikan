import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "../api/nurseAvailability";
import type { NurseAvailability } from "../api/types";

const NURSE_AVAILABILITY_QUERY_KEY = ["nurse-availability"] as const;

export function useNurseAvailabilities(filters?: {
  nurse_id?: string;
  year_month?: string;
  status?: "draft" | "submitted" | "approved";
}) {
  return useQuery<NurseAvailability[]>({
    queryKey: [...NURSE_AVAILABILITY_QUERY_KEY, filters],
    queryFn: () => api.getNurseAvailabilities(filters).then((res) => res.data),
  });
}

export function useNurseAvailability(id: number) {
  return useQuery<NurseAvailability>({
    queryKey: [...NURSE_AVAILABILITY_QUERY_KEY, id],
    queryFn: () => api.getNurseAvailabilityById(id).then((res) => res.data),
    enabled: !!id,
  });
}

export function useNurseAvailabilityByNurseAndMonth(
  nurse_id: string,
  year_month: string
) {
  return useQuery<NurseAvailability | null>({
    queryKey: [...NURSE_AVAILABILITY_QUERY_KEY, nurse_id, year_month],
    queryFn: async () => {
      try {
        const response = await api.getNurseAvailabilityByNurseAndMonth(nurse_id, year_month);
        console.log("API Response:", response.data);
        return response.data;
      } catch (error: any) {
        console.error("API Error:", error);
        // If 404, return null (no data found)
        if (error.response?.status === 404) {
          return null;
        }
        throw error;
      }
    },
    enabled: !!nurse_id && !!year_month,
  });
}

export function useCreateNurseAvailability() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<NurseAvailability>) =>
      api.createNurseAvailability(data).then((res) => res.data),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: NURSE_AVAILABILITY_QUERY_KEY }),
  });
}

export function useUpdateNurseAvailability() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<NurseAvailability>;
    }) => api.updateNurseAvailability(id, data).then((res) => res.data),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: NURSE_AVAILABILITY_QUERY_KEY }),
  });
}

export function useDeleteNurseAvailability() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api.deleteNurseAvailability(id),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: NURSE_AVAILABILITY_QUERY_KEY }),
  });
}

