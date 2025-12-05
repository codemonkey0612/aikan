import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "../api/corporations";
import type { Corporation } from "../api/types";

const CORPORATIONS_QUERY_KEY = ["corporations"] as const;

export function useCorporations() {
  return useQuery<Corporation[]>({
    queryKey: CORPORATIONS_QUERY_KEY,
    queryFn: () => api.getCorporations().then((res) => res.data),
  });
}

export function useCreateCorporation() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Corporation>) =>
      api.createCorporation(data).then((res) => res.data),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: CORPORATIONS_QUERY_KEY }),
  });
}

export function useUpdateCorporation() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Corporation> }) =>
      api.updateCorporation(id, data).then((res) => res.data),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: CORPORATIONS_QUERY_KEY }),
  });
}

export function useDeleteCorporation() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.deleteCorporation(id),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: CORPORATIONS_QUERY_KEY }),
  });
}



