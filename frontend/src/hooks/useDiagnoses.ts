import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DiagnosesAPIExtended } from "../api/endpoints";
import type { Diagnosis } from "../api/types";

const DIAGNOSES_QUERY_KEY = ["diagnoses"] as const;

export function useDiagnoses() {
  return useQuery<Diagnosis[]>({
    queryKey: DIAGNOSES_QUERY_KEY,
    queryFn: () => DiagnosesAPIExtended.list(),
  });
}

export function useDiagnosesByResident(resident_id: string) {
  return useQuery<Diagnosis[]>({
    queryKey: [...DIAGNOSES_QUERY_KEY, "resident", resident_id],
    queryFn: () => DiagnosesAPIExtended.getByResident(resident_id),
    enabled: !!resident_id,
  });
}

export function useDiagnosisById(id: number) {
  return useQuery<Diagnosis>({
    queryKey: [...DIAGNOSES_QUERY_KEY, id],
    queryFn: () => DiagnosesAPIExtended.get(id),
    enabled: !!id,
  });
}

export function useCreateDiagnosis() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Diagnosis>) => DiagnosesAPIExtended.create(data),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: DIAGNOSES_QUERY_KEY });
    },
  });
}

export function useUpdateDiagnosis() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Diagnosis> }) =>
      DiagnosesAPIExtended.update(id, data),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: DIAGNOSES_QUERY_KEY });
    },
  });
}

export function useDeleteDiagnosis() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => DiagnosesAPIExtended.remove(id),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: DIAGNOSES_QUERY_KEY });
    },
  });
}

