import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "../api/users";
import type { User, PaginatedResponse } from "../api/types";

const USERS_QUERY_KEY = ["users"] as const;
const getUsersQueryKey = (params?: UseUsersParams) =>
  ["users", params ?? null] as const;

export interface UseUsersParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  role?: User["role"];
  search?: string;
}

export function useUsers(params?: UseUsersParams) {
  // If pagination params are provided, use paginated endpoint
  if (params?.page || params?.limit) {
    return useQuery<PaginatedResponse<User>>({
      queryKey: getUsersQueryKey(params),
      queryFn: () => api.getUsersPaginated(params).then((res) => res.data),
    });
  }
  
  // Otherwise, use non-paginated endpoint
  return useQuery<User[]>({
    queryKey: USERS_QUERY_KEY,
    queryFn: () => api.getUsers().then((res) => res.data),
  });
}

export function useCreateUser() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<User>) =>
      api.createUser(data).then((res) => res.data),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: USERS_QUERY_KEY }),
  });
}

export function useUpdateUser() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: any) =>
      api.updateUser(id, data).then((res) => res.data),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: USERS_QUERY_KEY }),
  });
}

export function useDeleteUser() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api.deleteUser(id),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: USERS_QUERY_KEY }),
  });
}
