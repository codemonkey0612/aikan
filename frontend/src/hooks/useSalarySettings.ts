import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "../api/salarySettings";
import type { SalarySetting } from "../api/types";

const SALARY_SETTINGS_QUERY_KEY = ["salary-settings"] as const;

export function useSalarySettings() {
  return useQuery<SalarySetting[]>({
    queryKey: SALARY_SETTINGS_QUERY_KEY,
    queryFn: () => api.getSalarySettings().then((res) => res.data),
  });
}

export function useSalarySetting(key: string) {
  return useQuery<SalarySetting>({
    queryKey: [...SALARY_SETTINGS_QUERY_KEY, key],
    queryFn: () => api.getSalarySettingByKey(key).then((res) => res.data),
    enabled: !!key,
  });
}

export function useCreateSalarySetting() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<SalarySetting>) =>
      api.createSalarySetting(data).then((res) => res.data),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: SALARY_SETTINGS_QUERY_KEY }),
  });
}

export function useUpdateSalarySetting() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: ({
      key,
      data,
    }: {
      key: string;
      data: Partial<SalarySetting>;
    }) => api.updateSalarySetting(key, data).then((res) => res.data),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: SALARY_SETTINGS_QUERY_KEY }),
  });
}

export function useDeleteSalarySetting() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (key: string) => api.deleteSalarySetting(key),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: SALARY_SETTINGS_QUERY_KEY }),
  });
}

