import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlcoholChecksAPI } from "../api/endpoints";
import type { AlcoholCheck } from "../api/types";

const ALCOHOL_CHECKS_QUERY_KEY = ["alcohol-checks"] as const;

export function useAlcoholChecks() {
  return useQuery<AlcoholCheck[]>({
    queryKey: ALCOHOL_CHECKS_QUERY_KEY,
    queryFn: () => AlcoholChecksAPI.list(),
  });
}

export function useMyAlcoholChecks() {
  return useQuery<AlcoholCheck[]>({
    queryKey: [...ALCOHOL_CHECKS_QUERY_KEY, "my"],
    queryFn: () => AlcoholChecksAPI.getMy(),
  });
}

export function useAlcoholCheck(id: number) {
  return useQuery<AlcoholCheck>({
    queryKey: [...ALCOHOL_CHECKS_QUERY_KEY, id],
    queryFn: () => AlcoholChecksAPI.get(id),
    enabled: !!id,
  });
}

export function useCreateAlcoholCheck() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<AlcoholCheck>) => AlcoholChecksAPI.create(data),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ALCOHOL_CHECKS_QUERY_KEY });
    },
  });
}

export function useUpdateAlcoholCheck() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<AlcoholCheck> }) =>
      AlcoholChecksAPI.update(id, data),
    onSuccess: (_, variables) => {
      client.invalidateQueries({ queryKey: ALCOHOL_CHECKS_QUERY_KEY });
      client.invalidateQueries({ queryKey: [...ALCOHOL_CHECKS_QUERY_KEY, variables.id] });
    },
  });
}

export function useDeleteAlcoholCheck() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => AlcoholChecksAPI.remove(id),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ALCOHOL_CHECKS_QUERY_KEY });
    },
  });
}

