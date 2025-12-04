import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { VitalAlertsAPI } from "../api/endpoints";
import type { VitalAlert, VitalAlertTrigger } from "../api/types";

const VITAL_ALERTS_QUERY_KEY = ["vital-alerts"] as const;

export function useVitalAlerts() {
  return useQuery<VitalAlert[]>({
    queryKey: VITAL_ALERTS_QUERY_KEY,
    queryFn: () => VitalAlertsAPI.list(),
  });
}

export function useVitalAlertsByResident(resident_id: string) {
  return useQuery<VitalAlert[]>({
    queryKey: [...VITAL_ALERTS_QUERY_KEY, "resident", resident_id],
    queryFn: () => VitalAlertsAPI.getByResident(resident_id),
    enabled: !!resident_id,
  });
}

export function useVitalAlertById(id: number) {
  return useQuery<VitalAlert>({
    queryKey: [...VITAL_ALERTS_QUERY_KEY, id],
    queryFn: () => VitalAlertsAPI.get(id),
    enabled: !!id,
  });
}

export function useVitalAlertTriggers(params?: {
  resident_id?: string;
  acknowledged?: boolean;
}) {
  return useQuery<VitalAlertTrigger[]>({
    queryKey: [...VITAL_ALERTS_QUERY_KEY, "triggers", params],
    queryFn: () => VitalAlertsAPI.getTriggers(params),
  });
}

export function useCreateVitalAlert() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<VitalAlert>) => VitalAlertsAPI.create(data),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: VITAL_ALERTS_QUERY_KEY });
    },
  });
}

export function useUpdateVitalAlert() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<VitalAlert> }) =>
      VitalAlertsAPI.update(id, data),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: VITAL_ALERTS_QUERY_KEY });
    },
  });
}

export function useDeleteVitalAlert() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => VitalAlertsAPI.remove(id),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: VITAL_ALERTS_QUERY_KEY });
    },
  });
}

export function useAcknowledgeVitalAlertTrigger() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: ({ id, notes }: { id: number; notes?: string }) =>
      VitalAlertsAPI.acknowledgeTrigger(id, notes),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: [...VITAL_ALERTS_QUERY_KEY, "triggers"] });
    },
  });
}

