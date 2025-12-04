import { useState, useMemo } from "react";
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from "../hooks/useUsers";
import { useAuth } from "../hooks/useAuth";
import { UserCard } from "../components/users/UserCard";
import { UserFormModal } from "../components/users/UserFormModal";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import type { User } from "../api/types";

export function UsersPage() {
  const { user: currentUser } = useAuth();
  const { data: users, isLoading } = useUsers();
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<User["role"] | "ALL">("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  // フィルタリングと検索
  const filteredUsers = useMemo(() => {
    if (!users) return [];

    return users.filter((user) => {
      // ロールフィルター
      if (roleFilter !== "ALL" && user.role !== roleFilter) {
        return false;
      }

      // 検索クエリ
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const fullName = `${user.first_name || ""} ${user.last_name || ""}`.toLowerCase();
        const email = (user.email || "").toLowerCase();
        return (
          fullName.includes(query) ||
          email.includes(query) ||
          user.role.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [users, searchQuery, roleFilter]);

  // ロール別にグループ化
  const usersByRole = useMemo(() => {
    const grouped: Record<string, User[]> = {};
    filteredUsers.forEach((user) => {
      if (!grouped[user.role]) {
        grouped[user.role] = [];
      }
      grouped[user.role].push(user);
    });
    return grouped;
  }, [filteredUsers]);

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

      {/* ロール別セクション */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-sm text-slate-500">ユーザーを読み込み中...</p>
        </div>
      ) : Object.keys(usersByRole).length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-sm text-slate-500">
            {searchQuery || roleFilter !== "ALL"
              ? "条件に一致するユーザーが見つかりませんでした"
              : "ユーザーがまだ登録されていません"}
          </p>
        </div>
      ) : (
        Object.entries(usersByRole).map(([role, roleUsers]) => (
          <div key={role} className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">{role}</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {roleUsers.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  onEdit={isAdmin ? handleEditUser : undefined}
                  onDelete={isAdmin ? handleDeleteUser : undefined}
                />
              ))}
            </div>
          </div>
        ))
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
