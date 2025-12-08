import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "../api/notifications";
import type { Notification } from "../api/types";

const NOTIFICATIONS_QUERY_KEY = ["notifications"] as const;
const getNotificationsQueryKey = (params?: Record<string, unknown>) =>
  ["notifications", params ?? null] as const;

export function useNotifications(params?: Record<string, unknown>) {
  return useQuery<Notification[]>({
    queryKey: getNotificationsQueryKey(params),
    queryFn: async () => {
      const response = await api.getNotifications(params);
      const data = response.data;
      // Ensure we always return an array
      return Array.isArray(data) ? data : [];
    },
  });
}

export function useCreateNotification() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Notification>) =>
      api.createNotification(data).then((res) => res.data),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY }),
  });
}

export function useUpdateNotification() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Notification> }) =>
      api.updateNotification(id, data).then((res) => res.data),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY }),
  });
}

export function useDeleteNotification() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api.deleteNotification(id),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY }),
  });
}

