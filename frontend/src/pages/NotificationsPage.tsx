import { useMemo, useState } from "react";
import { useNotifications } from "../hooks/useNotifications";
import { Card } from "../components/ui/Card";
import { NotificationCard } from "../components/notifications/NotificationCard";
import {
  BellIcon,
  FunnelIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

type FilterStatus = "all" | "active" | "upcoming" | "expired";

function getNotificationStatus(notification: any): "active" | "upcoming" | "expired" {
  const now = new Date();
  const publishFrom = notification.publish_from
    ? new Date(notification.publish_from)
    : null;
  const publishTo = notification.publish_to
    ? new Date(notification.publish_to)
    : null;

  if (publishTo && now > publishTo) return "expired";
  if (publishFrom && now < publishFrom) return "upcoming";
  return "active";
}

export function NotificationsPage() {
  const { data, isLoading } = useNotifications();
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredNotifications = useMemo(() => {
    if (!data) return [];

    let filtered = data;

    // Filter by status
    if (filter !== "all") {
      filtered = filtered.filter((notification) => {
        const status = getNotificationStatus(notification);
        return status === filter;
      });
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (notification) =>
          notification.title?.toLowerCase().includes(query) ||
          notification.body?.toLowerCase().includes(query)
      );
    }

    // Sort by created_at (newest first)
    return filtered.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateB - dateA;
    });
  }, [data, filter, searchQuery]);

  const stats = useMemo(() => {
    if (!data) return { all: 0, active: 0, upcoming: 0, expired: 0 };
    
    return {
      all: data.length,
      active: data.filter((n) => getNotificationStatus(n) === "active").length,
      upcoming: data.filter((n) => getNotificationStatus(n) === "upcoming").length,
      expired: data.filter((n) => getNotificationStatus(n) === "expired").length,
    };
  }, [data]);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm uppercase tracking-wide text-slate-500">
          通知
        </p>
        <h1 className="text-3xl font-semibold text-slate-900">
          お知らせ
        </h1>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-100">
                <BellIcon className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">すべて</p>
                <p className="text-2xl font-semibold text-slate-900">
                  {stats.all}
                </p>
              </div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <BellIcon className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">公開中</p>
                <p className="text-2xl font-semibold text-green-600">
                  {stats.active}
                </p>
              </div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <BellIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">公開予定</p>
                <p className="text-2xl font-semibold text-blue-600">
                  {stats.upcoming}
                </p>
              </div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-100">
                <BellIcon className="h-5 w-5 text-slate-400" />
              </div>
              <div>
                <p className="text-sm text-slate-500">期限切れ</p>
                <p className="text-2xl font-semibold text-slate-400">
                  {stats.expired}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="お知らせを検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
              <BellIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-slate-100"
                >
                  <XMarkIcon className="h-4 w-4 text-slate-400" />
                </button>
              )}
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <FunnelIcon className="h-5 w-5 text-slate-500" />
            <div className="flex gap-2">
              {(
                [
                  { value: "all", label: "すべて" },
                  { value: "active", label: "公開中" },
                  { value: "upcoming", label: "公開予定" },
                  { value: "expired", label: "期限切れ" },
                ] as const
              ).map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFilter(option.value as FilterStatus)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === option.value
                      ? "bg-brand-600 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Notifications List */}
      <Card>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
              <p className="mt-4 text-slate-500">お知らせを読み込み中...</p>
            </div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex p-4 rounded-full bg-slate-100 mb-4">
              <BellIcon className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-lg font-medium text-slate-900 mb-2">
              {searchQuery || filter !== "all"
                ? "条件に一致するお知らせがありません"
                : "お知らせがまだ登録されていません"}
            </p>
            <p className="text-sm text-slate-500">
              {searchQuery || filter !== "all"
                ? "検索条件やフィルターを変更してみてください"
                : "新しいお知らせが追加されるとここに表示されます"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredNotifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

