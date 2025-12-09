import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import type { Notification } from "../../api/types";
import { useCreateNotification, useUpdateNotification } from "../../hooks/useNotifications";
import toast from "react-hot-toast";

interface NotificationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  notification?: Notification | null;
}

const NOTIFICATION_CATEGORIES = [
  { value: "general", label: "一般" },
  { value: "announcement", label: "お知らせ" },
  { value: "important", label: "重要" },
  { value: "maintenance", label: "メンテナンス" },
  { value: "event", label: "イベント" },
  { value: "other", label: "その他" },
];

const TARGET_ROLES = [
  { value: "", label: "全員" },
  { value: "admin", label: "管理者" },
  { value: "nurse", label: "看護師" },
  { value: "facility_manager", label: "施設管理者" },
  { value: "corporate_officer", label: "法人担当者" },
];

// Format datetime-local value to MySQL DATETIME format (YYYY-MM-DD HH:mm:ss)
function formatDateTimeForMySQL(datetimeLocal: string): string {
  if (!datetimeLocal) return "";
  // datetime-local format is "YYYY-MM-DDTHH:mm", convert to "YYYY-MM-DD HH:mm:ss"
  return datetimeLocal.replace("T", " ") + ":00";
}

// Convert MySQL DATETIME or ISO string to datetime-local format (YYYY-MM-DDTHH:mm)
function formatDateTimeForInput(dateString: string | null | undefined): string {
  if (!dateString) return "";
  try {
    // Handle MySQL format "YYYY-MM-DD HH:mm:ss" or ISO format
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    // Get local date/time components
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch {
    return "";
  }
}

export function NotificationFormModal({
  isOpen,
  onClose,
  notification,
}: NotificationFormModalProps) {
  const isEdit = !!notification;
  const createMutation = useCreateNotification();
  const updateMutation = useUpdateNotification();

  const [formData, setFormData] = useState({
    title: "",
    body: "",
    category: "",
    target_role: "",
    publish_from: "",
    publish_to: "",
  });

  useEffect(() => {
    if (notification) {
      setFormData({
        title: notification.title || "",
        body: notification.body || "",
        category: notification.category || "",
        target_role: notification.target_role || "",
        publish_from: formatDateTimeForInput(notification.publish_from),
        publish_to: formatDateTimeForInput(notification.publish_to),
      });
    } else {
      setFormData({
        title: "",
        body: "",
        category: "",
        target_role: "",
        publish_from: "",
        publish_to: "",
      });
    }
  }, [notification, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("タイトルを入力してください");
      return;
    }

    try {
      const data = {
        title: formData.title.trim(),
        body: formData.body.trim() || null,
        category: formData.category || null,
        target_role: formData.target_role || null,
        publish_from: formData.publish_from
          ? formatDateTimeForMySQL(formData.publish_from)
          : null,
        publish_to: formData.publish_to
          ? formatDateTimeForMySQL(formData.publish_to)
          : null,
      };

      if (isEdit && notification) {
        await updateMutation.mutateAsync({ id: notification.id, data });
        toast.success("お知らせを更新しました");
      } else {
        await createMutation.mutateAsync(data);
        toast.success("お知らせを作成しました");
      }

      onClose();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "エラーが発生しました");
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

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
                  <div className="flex items-center justify-between">
                    <Dialog.Title className="text-2xl font-bold text-white">
                      {isEdit ? "お知らせを編集" : "新しいお知らせ"}
                    </Dialog.Title>
                    <button
                      onClick={onClose}
                      className="p-2 rounded-lg hover:bg-white/20 text-white transition-colors"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      タイトル <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                      placeholder="お知らせのタイトルを入力"
                      required
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      カテゴリ
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                    >
                      <option value="">選択してください</option>
                      {NOTIFICATION_CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Body */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      内容
                    </label>
                    <textarea
                      value={formData.body}
                      onChange={(e) =>
                        setFormData({ ...formData, body: e.target.value })
                      }
                      rows={6}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                      placeholder="お知らせの内容を入力"
                    />
                  </div>

                  {/* Target Role */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      対象
                    </label>
                    <select
                      value={formData.target_role}
                      onChange={(e) =>
                        setFormData({ ...formData, target_role: e.target.value })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                    >
                      {TARGET_ROLES.map((role) => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Publish Dates */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        公開開始日時
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.publish_from}
                        onChange={(e) =>
                          setFormData({ ...formData, publish_from: e.target.value })
                        }
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        公開終了日時
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.publish_to}
                        onChange={(e) =>
                          setFormData({ ...formData, publish_to: e.target.value })
                        }
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                      />
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                    >
                      キャンセル
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-4 py-2 rounded-lg bg-brand-600 text-white font-medium hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading
                        ? isEdit
                          ? "更新中..."
                          : "作成中..."
                        : isEdit
                        ? "更新"
                        : "作成"}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

