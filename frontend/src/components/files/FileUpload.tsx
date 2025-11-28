import { useState, useRef } from "react";
import { useUploadFile } from "../../hooks/useFiles";
import { PaperClipIcon, XMarkIcon } from "@heroicons/react/24/outline";
import type { FileCategory } from "../../api/types";

interface FileUploadProps {
  category: FileCategory;
  entity_type: string;
  entity_id: number;
  onUploadSuccess?: () => void;
  accept?: string;
  maxSize?: number; // in bytes
  multiple?: boolean;
}

export function FileUpload({
  category,
  entity_type,
  entity_id,
  onUploadSuccess,
  accept,
  maxSize = 10 * 1024 * 1024, // 10MB default
  multiple = false,
}: FileUploadProps) {
  const uploadMutation = useUploadFile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string>("");

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setError("");

    // ファイルサイズチェック
    const oversizedFiles = files.filter((file) => file.size > maxSize);
    if (oversizedFiles.length > 0) {
      setError(`ファイルサイズが大きすぎます。最大${maxSize / 1024 / 1024}MBまでです。`);
      return;
    }

    setSelectedFiles(files);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setError("ファイルを選択してください");
      return;
    }

    setError("");

    try {
      for (const file of selectedFiles) {
        await uploadMutation.mutateAsync({
          file,
          category,
          entity_type,
          entity_id,
        });
      }
      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      onUploadSuccess?.();
    } catch (error: any) {
      setError(error?.response?.data?.message || "ファイルのアップロードに失敗しました");
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          accept={accept}
          multiple={multiple}
          className="hidden"
          id={`file-upload-${entity_type}-${entity_id}`}
        />
        <label
          htmlFor={`file-upload-${entity_type}-${entity_id}`}
          className="flex cursor-pointer items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          <PaperClipIcon className="h-4 w-4" />
          ファイルを選択
        </label>
        {selectedFiles.length > 0 && (
          <button
            onClick={handleUpload}
            disabled={uploadMutation.isPending}
            className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-500 disabled:opacity-60"
          >
            {uploadMutation.isPending ? "アップロード中..." : "アップロード"}
          </button>
        )}
      </div>

      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          {selectedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2"
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">{file.name}</p>
                <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
              </div>
              <button
                onClick={() => removeFile(index)}
                className="rounded-md p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
          {error}
        </div>
      )}
    </div>
  );
}

