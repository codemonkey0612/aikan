import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "../api/salaries";
import type { Salary, SalaryCalculationResult } from "../api/types";

const SALARIES_QUERY_KEY = ["salaries"] as const;
const getSalariesQueryKey = (params?: {
  user_id?: number;
  nurse_id?: string;
  year_month?: string;
}) => ["salaries", params ?? null] as const;

export function useSalaries(params?: {
  user_id?: number;
  nurse_id?: string;
  year_month?: string;
}) {
  return useQuery<Salary[]>({
    queryKey: getSalariesQueryKey(params),
    queryFn: () => api.getSalaries(params).then((res) => res.data),
  });
}

export function useCalculateNurseSalary(
  nurse_id: string,
  year_month: string,
  enabled: boolean = true
) {
  return useQuery<SalaryCalculationResult>({
    queryKey: ["salary-calculation", nurse_id, year_month],
    queryFn: () =>
      api.calculateNurseSalary(nurse_id, year_month).then((res) => res.data),
    enabled: enabled && !!nurse_id && !!year_month,
  });
}

export function useCalculateAndSaveSalary() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (data: { nurse_id: string; year_month: string }) =>
      api.calculateAndSaveSalary(data).then((res) => res.data),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: SALARIES_QUERY_KEY }),
  });
}

export function useCreateSalary() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Salary>) =>
      api.createSalary(data).then((res) => res.data),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: SALARIES_QUERY_KEY }),
  });
}

export function useUpdateSalary() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Salary> }) =>
      api.updateSalary(id, data).then((res) => res.data),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: SALARIES_QUERY_KEY }),
  });
}

export function useDeleteSalary() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api.deleteSalary(id),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: SALARIES_QUERY_KEY }),
  });
}

