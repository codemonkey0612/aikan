import { useState, useMemo, useEffect } from "react";
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from "../hooks/useUsers";
import { useAuth } from "../hooks/useAuth";
import { UserCard } from "../components/users/UserCard";
import { UserFormModal } from "../components/users/UserFormModal";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import type { User } from "../api/types";

const ITEMS_PER_PAGE = 12;

export function UsersPage() {
  const { user: currentUser } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<User["role"] | "ALL">("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, roleFilter]);

  const { data, isLoading } = useUsers({
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    search: searchQuery || undefined,
    role: roleFilter !== "ALL" ? roleFilter : undefined,
    sortBy: "created_at",
    sortOrder: "desc",
  });

  const users = useMemo(() => {
    if (!data) return [];
    // Check if data is paginated response
    if ("data" in data && "pagination" in data) {
      return data.data;
    }
    // Otherwise it's an array
    return Array.isArray(data) ? data : [];
  }, [data]);

  const pagination = useMemo(() => {
    if (!data || !("pagination" in data)) return null;
    return data.pagination;
  }, [data]);

  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();

  const handleCreateUser = async (data: any) => {
    await createUserMutation.mutateAsync(data);
  };

  const handleUpdateUser = async (data: any) => {
    if (editingUser) {
      await updateUserMutation.mutateAsync({ id: editingUser.id, data });
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (window.confirm(`${user.first_name} ${user.last_name} を削除してもよろしいですか？`)) {
      await deleteUserMutation.mutateAsync(user.id);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const isAdmin = currentUser?.role === "admin";

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">ユーザー管理</h1>
        </div>
        <div className="flex items-center gap-3">
          {/* 検索バー */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="検索"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 rounded-md border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          {/* フィルターボタン */}
          <div className="relative">
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className="flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <FunnelIcon className="h-4 w-4" />
              フィルター
            </button>
            {showFilterMenu && (
              <div className="absolute right-0 z-10 mt-2 w-48 rounded-md border border-slate-200 bg-white shadow-lg">
                <div className="p-2">
                  <button
                    onClick={() => {
                      setRoleFilter("ALL");
                      setShowFilterMenu(false);
                    }}
                    className={`w-full rounded-md px-3 py-2 text-left text-sm ${
                      roleFilter === "ALL"
                        ? "bg-brand-50 text-brand-700"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    すべて
                  </button>
                  {["admin", "nurse", "facility_manager", "corporate_officer"].map((role) => (
                    <button
                      key={role}
                      onClick={() => {
                        setRoleFilter(role as User["role"]);
                        setShowFilterMenu(false);
                      }}
                      className={`w-full rounded-md px-3 py-2 text-left text-sm ${
                        roleFilter === role
                          ? "bg-brand-50 text-brand-700"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {role.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 新規ユーザーボタン（ADMINのみ） */}
          {isAdmin && (
            <button
              onClick={() => {
                setEditingUser(null);
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-500"
            >
              <PlusIcon className="h-4 w-4" />
              新規
            </button>
          )}
        </div>
      </header>

      {/* ユーザー一覧 */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-sm text-slate-500">ユーザーを読み込み中...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-sm text-slate-500">
            {searchQuery || roleFilter !== "ALL"
              ? "条件に一致するユーザーが見つかりませんでした"
              : "ユーザーがまだ登録されていません"}
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {users.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                onEdit={isAdmin ? handleEditUser : undefined}
                onDelete={isAdmin ? handleDeleteUser : undefined}
              />
            ))}
          </div>

          {/* ページネーション */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 pt-4">
              <div className="text-sm text-slate-600">
                {pagination.total}件中 {((pagination.page - 1) * pagination.limit) + 1}-
                {Math.min(pagination.page * pagination.limit, pagination.total)}件を表示
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={!pagination.hasPrev}
                  className="flex items-center gap-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                  前へ
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = pagination.page - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-2 text-sm font-medium rounded-md transition ${
                          pagination.page === pageNum
                            ? "bg-blue-600 text-white"
                            : "text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
                  disabled={!pagination.hasNext}
                  className="flex items-center gap-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  次へ
                  <ChevronRightIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* モーダル */}
      <UserFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={editingUser ? handleUpdateUser : handleCreateUser}
        user={editingUser}
        mode={editingUser ? "edit" : "create"}
      />
    </div>
  );
}
