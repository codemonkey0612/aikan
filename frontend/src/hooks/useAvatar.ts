import { useQuery } from "@tanstack/react-query";
import { FilesAPI } from "../api/endpoints";

export function useAvatar(userId?: number) {
  return useQuery({
    queryKey: ["avatar", userId],
    queryFn: async () => {
      if (!userId) return null;
      const files = await FilesAPI.getByEntity("user", userId);
      const avatarFile = files.find((f) => f.category === "PROFILE_AVATAR");
      if (!avatarFile) return null;
      return FilesAPI.get(avatarFile.id);
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5分間キャッシュ
  });
}

