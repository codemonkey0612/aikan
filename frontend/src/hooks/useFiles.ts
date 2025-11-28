import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FilesAPI } from "../api/endpoints";
import type { File, FileCategory } from "../api/types";

const FILES_QUERY_KEY = ["files"] as const;

export function useFilesByEntity(entity_type: string, entity_id: number) {
  return useQuery<File[]>({
    queryKey: [...FILES_QUERY_KEY, "entity", entity_type, entity_id],
    queryFn: () => FilesAPI.getByEntity(entity_type, entity_id),
    enabled: !!entity_type && !!entity_id,
  });
}

export function useFilesByCategory(category: FileCategory) {
  return useQuery<File[]>({
    queryKey: [...FILES_QUERY_KEY, "category", category],
    queryFn: () => FilesAPI.getByCategory(category),
  });
}

export function useUploadFile() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: ({
      file,
      category,
      entity_type,
      entity_id,
    }: {
      file: File;
      category: FileCategory;
      entity_type: string;
      entity_id: number;
    }) => FilesAPI.upload(file, category, entity_type, entity_id),
    onSuccess: (_, variables) => {
      // ファイル一覧のキャッシュを無効化
      client.invalidateQueries({
        queryKey: [...FILES_QUERY_KEY, "entity", variables.entity_type, variables.entity_id],
      });
      client.invalidateQueries({
        queryKey: [...FILES_QUERY_KEY, "category", variables.category],
      });
      // アバターのキャッシュも無効化（PROFILE_AVATARの場合）
      if (variables.category === "PROFILE_AVATAR" && variables.entity_type === "user") {
        client.invalidateQueries({
          queryKey: ["avatar", variables.entity_id],
        });
      }
    },
  });
}

export function useDeleteFile() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => FilesAPI.remove(id),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: FILES_QUERY_KEY });
    },
  });
}

