import { useState } from "react";
import {
  BellIcon,
  CalendarIcon,
  UserGroupIcon,
  ClockIcon,
  ChevronRightIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import type { Notification } from "../../api/types";
import { NotificationDetailModal } from "./NotificationDetailModal";
import { useAuth } from "../../hooks/useAuth";
import { useDeleteNotification } from "../../hooks/useNotifications";
import toast from "react-hot-toast";

interface NotificationCardProps {
  notification: Notification;
  onEdit?: (notification: Notification) => void;
}

function getNotificationStatus(notification: Notification): {
  status: "active" | "upcoming" | "expired";
  label: string;
  color: string;
  bgColor: string;
} {
  const now = new Date();
  const publishFrom = notification.publish_from
    ? new Date(notification.publish_from)
    : null;
  const publishTo = notification.publish_to
    ? new Date(notification.publish_to)
    : null;

  if (publishTo && now > publishTo) {
    return {
      status: "expired",
      label: "期限切れ",
      color: "text-slate-500",
      bgColor: "bg-slate-100",
    };
  }

  if (publishFrom && now < publishFrom) {
    return {
      status: "upcoming",
      label: "公開予定",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    };
  }

  return {
    status: "active",
    label: "公開中",
    color: "text-green-600",
    bgColor: "bg-green-100",
  };
}

function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "未設定";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "無効な日付";
  }
}

function getRoleLabel(role: string | null | undefined): string {
  if (!role) return "全員";
  const roleMap: Record<string, string> = {
    admin: "管理者",
    nurse: "看護師",
    facility_manager: "施設管理者",
    corporate_officer: "法人担当者",
  };
  return roleMap[role] || role;
}

export function NotificationCard({ notification, onEdit }: NotificationCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();
  const deleteMutation = useDeleteNotification();
  const status = getNotificationStatus(notification);

  const canEdit = user && notification.created_by === user.id;
  const canDelete = user && (notification.created_by === user.id || user.role === "admin");

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("このお知らせを削除してもよろしいですか？")) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(notification.id);
      toast.success("お知らせを削除しました");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "削除に失敗しました");
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(notification);
    }
  };

  return (
    <>
      <div
        onClick={() => setIsModalOpen(true)}
        className="group relative bg-white rounded-xl border border-slate-200 p-6 hover:border-brand-300 hover:shadow-lg transition-all duration-200 cursor-pointer"
      >
        {/* Status Badge and Actions */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${status.color} ${status.bgColor}`}
          >
            <div
              className={`h-1.5 w-1.5 rounded-full ${
                status.status === "active"
                  ? "bg-green-500"
                  : status.status === "upcoming"
                  ? "bg-blue-500"
                  : "bg-slate-400"
              }`}
            />
            {status.label}
          </span>
          {(canEdit || canDelete) && (
            <div className="flex items-center gap-1">
              {canEdit && (
                <button
                  onClick={handleEdit}
                  className="p-1.5 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                  title="編集"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
              )}
              {canDelete && (
                <button
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="p-1.5 rounded-lg bg-rose-100 text-rose-600 hover:bg-rose-200 transition-colors disabled:opacity-50"
                  title="削除"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="pr-20">
          {/* Title */}
          <div className="flex items-start gap-3 mb-3">
            <div className="mt-1 p-2 rounded-lg bg-brand-100">
              <BellIcon className="h-5 w-5 text-brand-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-900 group-hover:text-brand-600 transition-colors">
                {notification.title || "タイトル未設定"}
              </h3>
            </div>
          </div>

          {/* Body Preview */}
          {notification.body && (
            <p className="text-sm text-slate-600 line-clamp-2 mb-4">
              {notification.body}
            </p>
          )}

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
            {/* Category */}
            {notification.category && (
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded bg-brand-100 text-brand-700 font-medium">
                  {notification.category}
                </span>
              </div>
            )}
            {/* Target Role */}
            <div className="flex items-center gap-1.5">
              <UserGroupIcon className="h-4 w-4" />
              <span>{getRoleLabel(notification.target_role)}</span>
            </div>

            {/* Publish Period */}
            {(notification.publish_from || notification.publish_to) && (
              <div className="flex items-center gap-1.5">
                <CalendarIcon className="h-4 w-4" />
                <span>
                  {notification.publish_from
                    ? formatDate(notification.publish_from)
                    : "開始日未設定"}
                  {notification.publish_to && (
                    <>
                      {" "}
                      <span className="mx-1">→</span>{" "}
                      {formatDate(notification.publish_to)}
                    </>
                  )}
                </span>
              </div>
            )}

            {/* Created Date */}
            <div className="flex items-center gap-1.5">
              <ClockIcon className="h-4 w-4" />
              <span>作成: {formatDate(notification.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Hover Arrow */}
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <ChevronRightIcon className="h-5 w-5 text-brand-600" />
        </div>
      </div>

      <NotificationDetailModal
        notification={notification}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}

