import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AuthAPI } from "../api/endpoints";
import type { User } from "../api/types";

const PROFILE_QUERY_KEY = ["profile"] as const;

export function useProfile() {
  return useQuery<User>({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: () => AuthAPI.me(),
  });
}

export function useUpdateProfile() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      first_name?: string | null;
      last_name?: string | null;
      email?: string | null;
      phone?: string | null;
    }) => AuthAPI.updateProfile(data),
    onSuccess: (data) => {
      client.setQueryData(PROFILE_QUERY_KEY, data);
      // ユーザー情報も更新
      client.invalidateQueries({ queryKey: ["user"] });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: {
      current_password: string;
      new_password: string;
      confirm_password: string;
    }) => AuthAPI.changePassword(data),
  });
}

