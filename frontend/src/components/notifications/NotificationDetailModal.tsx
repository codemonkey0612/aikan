import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  XMarkIcon,
  BellIcon,
  CalendarIcon,
  UserGroupIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import type { Notification } from "../../api/types";

interface NotificationDetailModalProps {
  notification: Notification;
  isOpen: boolean;
  onClose: () => void;
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

export function NotificationDetailModal({
  notification,
  isOpen,
  onClose,
}: NotificationDetailModalProps) {
  const status = getNotificationStatus(notification);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all">
                {/* Header */}
                <div className="relative bg-gradient-to-r from-brand-500 to-brand-600 px-6 py-5">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-white/20">
                      <BellIcon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <Dialog.Title className="text-2xl font-bold text-white mb-2">
                        {notification.title || "タイトル未設定"}
                      </Dialog.Title>
                      <div className="flex items-center gap-2">
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
                      </div>
                    </div>
                    <button
                      onClick={onClose}
                      className="p-2 rounded-lg hover:bg-white/20 text-white transition-colors"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="px-6 py-6">
                  {/* Body */}
                  {notification.body ? (
                    <div className="mb-6">
                      <div className="prose prose-slate max-w-none">
                        <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                          {notification.body}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-6 p-4 rounded-lg bg-slate-50 text-slate-500 text-center">
                      内容がありません
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="border-t border-slate-200 pt-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Target Role */}
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-slate-100">
                          <UserGroupIcon className="h-5 w-5 text-slate-600" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                            対象
                          </p>
                          <p className="text-sm font-medium text-slate-900">
                            {getRoleLabel(notification.target_role)}
                          </p>
                        </div>
                      </div>

                      {/* Created Date */}
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-slate-100">
                          <ClockIcon className="h-5 w-5 text-slate-600" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                            作成日時
                          </p>
                          <p className="text-sm font-medium text-slate-900">
                            {formatDate(notification.created_at)}
                          </p>
                        </div>
                      </div>

                      {/* Publish From */}
                      {notification.publish_from && (
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-blue-100">
                            <CalendarIcon className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                              公開開始
                            </p>
                            <p className="text-sm font-medium text-slate-900">
                              {formatDate(notification.publish_from)}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Publish To */}
                      {notification.publish_to && (
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-red-100">
                            <CalendarIcon className="h-5 w-5 text-red-600" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                              公開終了
                            </p>
                            <p className="text-sm font-medium text-slate-900">
                              {formatDate(notification.publish_to)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 rounded-lg bg-brand-600 text-white font-medium hover:bg-brand-700 transition-colors"
                  >
                    閉じる
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

