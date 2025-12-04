import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CarePlansAPI } from "../api/endpoints";
import type { CarePlan, CarePlanItem } from "../api/types";

const CARE_PLANS_QUERY_KEY = ["care-plans"] as const;

export function useCarePlans() {
  return useQuery<CarePlan[]>({
    queryKey: CARE_PLANS_QUERY_KEY,
    queryFn: () => CarePlansAPI.list(),
  });
}

export function useCarePlansByResident(resident_id: string) {
  return useQuery<CarePlan[]>({
    queryKey: [...CARE_PLANS_QUERY_KEY, "resident", resident_id],
    queryFn: () => CarePlansAPI.getByResident(resident_id),
    enabled: !!resident_id,
  });
}

export function useCarePlanById(id: number) {
  return useQuery<CarePlan>({
    queryKey: [...CARE_PLANS_QUERY_KEY, id],
    queryFn: () => CarePlansAPI.get(id),
    enabled: !!id,
  });
}

export function useCarePlanItems(care_plan_id: number) {
  return useQuery<CarePlanItem[]>({
    queryKey: [...CARE_PLANS_QUERY_KEY, "items", care_plan_id],
    queryFn: () => CarePlansAPI.getItems(care_plan_id),
    enabled: !!care_plan_id,
  });
}

export function useCreateCarePlan() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<CarePlan>) => CarePlansAPI.create(data),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: CARE_PLANS_QUERY_KEY });
    },
  });
}

export function useUpdateCarePlan() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CarePlan> }) =>
      CarePlansAPI.update(id, data),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: CARE_PLANS_QUERY_KEY });
    },
  });
}

export function useDeleteCarePlan() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => CarePlansAPI.remove(id),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: CARE_PLANS_QUERY_KEY });
    },
  });
}

export function useCreateCarePlanItem() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<CarePlanItem>) => CarePlansAPI.createItem(data),
    onSuccess: (data) => {
      client.invalidateQueries({ queryKey: [...CARE_PLANS_QUERY_KEY, "items"] });
      if (data?.care_plan_id) {
        client.invalidateQueries({ queryKey: [...CARE_PLANS_QUERY_KEY, "items", data.care_plan_id] });
      }
    },
  });
}

export function useUpdateCarePlanItem() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CarePlanItem> }) =>
      CarePlansAPI.updateItem(id, data),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: [...CARE_PLANS_QUERY_KEY, "items"] });
    },
  });
}

export function useDeleteCarePlanItem() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => CarePlansAPI.deleteItem(id),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: [...CARE_PLANS_QUERY_KEY, "items"] });
    },
  });
}

