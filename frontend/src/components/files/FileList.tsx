import { useFilesByEntity, useDeleteFile } from "../../hooks/useFiles";
import { useQueryClient } from "@tanstack/react-query";
import { FilesAPI } from "../../api/endpoints";
import { DocumentIcon, PhotoIcon, TrashIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import type { FileCategory } from "../../api/types";

interface FileListProps {
  category: FileCategory;
  entity_type: string;
  entity_id: number;
  showDelete?: boolean;
}

export function FileList({
  category,
  entity_type,
  entity_id,
  showDelete = true,
}: FileListProps) {
  const { data: files, isLoading } = useFilesByEntity(entity_type, entity_id);
  const deleteFileMutation = useDeleteFile();
  const queryClient = useQueryClient();

  // カテゴリでフィルタリング
  const filteredFiles = files?.filter((file) => file.category === category) || [];

  const handleDownload = async (fileId: number, fileName: string) => {
    try {
      const url = await FilesAPI.get(fileId);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert("ファイルのダウンロードに失敗しました");
    }
  };

  const handleDelete = async (fileId: number) => {
    if (window.confirm("このファイルを削除してもよろしいですか？")) {
      try {
        await deleteFileMutation.mutateAsync(fileId);
        // アバターの場合、キャッシュを無効化
        if (category === "PROFILE_AVATAR" && entity_type === "user") {
          await queryClient.invalidateQueries({
            queryKey: ["avatar", entity_id],
          });
        }
      } catch (error) {
        alert("ファイルの削除に失敗しました");
      }
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const getFileIcon = (mimeType: string | null) => {
    if (!mimeType) return DocumentIcon;
    if (mimeType.startsWith("image/")) return PhotoIcon;
    if (mimeType === "application/pdf") return DocumentIcon;
    return DocumentIcon;
  };

  if (isLoading) {
    return <p className="text-sm text-slate-500">ファイルを読み込み中...</p>;
  }

  if (filteredFiles.length === 0) {
    return <p className="text-sm text-slate-500">ファイルがありません</p>;
  }

  return (
    <div className="space-y-2">
      {filteredFiles.map((file) => {
        const Icon = getFileIcon(file.mime_type);
        return (
          <div
            key={file.id}
            className="flex items-center justify-between rounded-md border border-slate-200 bg-white p-3"
          >
            <div className="flex items-center gap-3 flex-1">
              <Icon className="h-5 w-5 text-slate-400" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {file.original_name}
                </p>
                <p className="text-xs text-slate-500">
                  {formatFileSize(file.file_size)} • {new Date(file.created_at).toLocaleDateString("ja-JP")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDownload(file.id, file.original_name)}
                className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-brand-600"
                title="ダウンロード"
              >
                <ArrowDownTrayIcon className="h-4 w-4" />
              </button>
              {showDelete && (
                <button
                  onClick={() => handleDelete(file.id)}
                  className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-rose-600"
                  title="削除"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

