import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import type { Corporation } from "../../api/types";

interface CorporationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  corporation?: Corporation | null;
  mode?: "create" | "edit";
}

export function CorporationFormModal({
  isOpen,
  onClose,
  onSubmit,
  corporation,
  mode = "create",
}: CorporationFormModalProps) {
  const [formData, setFormData] = useState({
    corporation_id: "",
    corporation_number: "",
    name: "",
    name_kana: "",
    postal_code: "",
    address_prefecture: "",
    address_city: "",
    address_building: "",
    latitude_longitude: "",
    phone_number: "",
    contact_email: "",
    billing_unit_price: "",
    billing_method_id: "",
    photo_url: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && corporation) {
        setFormData({
          corporation_id: corporation.corporation_id || "",
          corporation_number: corporation.corporation_number || "",
          name: corporation.name || "",
          name_kana: corporation.name_kana || "",
          postal_code: corporation.postal_code || "",
          address_prefecture: corporation.address_prefecture || "",
          address_city: corporation.address_city || "",
          address_building: corporation.address_building || "",
          latitude_longitude: corporation.latitude_longitude || "",
          phone_number: corporation.phone_number || "",
          contact_email: corporation.contact_email || "",
          billing_unit_price: corporation.billing_unit_price?.toString() || "",
          billing_method_id: corporation.billing_method_id || "",
          photo_url: corporation.photo_url || "",
          notes: corporation.notes || "",
        });
      } else {
        setFormData({
          corporation_id: "",
          corporation_number: "",
          name: "",
          name_kana: "",
          postal_code: "",
          address_prefecture: "",
          address_city: "",
          address_building: "",
          latitude_longitude: "",
          phone_number: "",
          contact_email: "",
          billing_unit_price: "",
          billing_method_id: "",
          photo_url: "",
          notes: "",
        });
      }
      setErrors({});
    }
  }, [isOpen, corporation, mode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (mode === "create" && !formData.corporation_id) {
      setErrors({ corporation_id: "法人IDは必須です" });
      return;
    }
    if (!formData.name) {
      setErrors({ name: "法人名は必須です" });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: any = {
        corporation_id: formData.corporation_id || null,
        corporation_number: formData.corporation_number || null,
        name: formData.name,
        name_kana: formData.name_kana || null,
        postal_code: formData.postal_code || null,
        address_prefecture: formData.address_prefecture || null,
        address_city: formData.address_city || null,
        address_building: formData.address_building || null,
        latitude_longitude: formData.latitude_longitude || null,
        phone_number: formData.phone_number || null,
        contact_email: formData.contact_email || null,
        billing_unit_price: formData.billing_unit_price ? parseFloat(formData.billing_unit_price) : null,
        billing_method_id: formData.billing_method_id || null,
        photo_url: formData.photo_url || null,
        notes: formData.notes || null,
      };
      await onSubmit(payload);
      onClose();
    } catch (error: any) {
      if (error?.response?.data?.errors) {
        const validationErrors: Record<string, string> = {};
        error.response.data.errors.forEach((err: any) => {
          validationErrors[err.path] = err.message;
        });
        setErrors(validationErrors);
      } else {
        setErrors({ general: error?.response?.data?.message || "エラーが発生しました" });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
      <div className="w-full max-w-3xl rounded-lg bg-white shadow-xl my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">
            {mode === "create" ? "新規法人登録" : "法人編集"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {errors.general && (
            <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
              {errors.general}
            </div>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  法人ID <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.corporation_id}
                  onChange={(e) =>
                    setFormData({ ...formData, corporation_id: e.target.value })
                  }
                  disabled={mode === "edit"}
                  className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm ${
                    errors.corporation_id
                      ? "border-rose-500"
                      : "border-slate-300 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  } ${mode === "edit" ? "bg-slate-100" : ""}`}
                />
                {errors.corporation_id && (
                  <p className="mt-1 text-xs text-rose-600">{errors.corporation_id}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  法人番号
                </label>
                <input
                  type="text"
                  value={formData.corporation_number}
                  onChange={(e) =>
                    setFormData({ ...formData, corporation_number: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  法人名 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm ${
                    errors.name
                      ? "border-rose-500"
                      : "border-slate-300 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  }`}
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-rose-600">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  法人名（カナ）
                </label>
                <input
                  type="text"
                  value={formData.name_kana}
                  onChange={(e) =>
                    setFormData({ ...formData, name_kana: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                郵便番号
              </label>
              <input
                type="text"
                value={formData.postal_code}
                onChange={(e) =>
                  setFormData({ ...formData, postal_code: e.target.value })
                }
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  都道府県
                </label>
                <input
                  type="text"
                  value={formData.address_prefecture}
                  onChange={(e) =>
                    setFormData({ ...formData, address_prefecture: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  市区町村
                </label>
                <input
                  type="text"
                  value={formData.address_city}
                  onChange={(e) =>
                    setFormData({ ...formData, address_city: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  建物名
                </label>
                <input
                  type="text"
                  value={formData.address_building}
                  onChange={(e) =>
                    setFormData({ ...formData, address_building: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                緯度・経度（例: 35.6895,139.6917）
              </label>
              <input
                type="text"
                value={formData.latitude_longitude}
                onChange={(e) =>
                  setFormData({ ...formData, latitude_longitude: e.target.value })
                }
                placeholder="35.6895,139.6917"
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  電話番号
                </label>
                <input
                  type="text"
                  value={formData.phone_number}
                  onChange={(e) =>
                    setFormData({ ...formData, phone_number: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  メールアドレス
                </label>
                <input
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) =>
                    setFormData({ ...formData, contact_email: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  請求単価
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.billing_unit_price}
                  onChange={(e) =>
                    setFormData({ ...formData, billing_unit_price: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  請求方法ID
                </label>
                <input
                  type="text"
                  value={formData.billing_method_id}
                  onChange={(e) =>
                    setFormData({ ...formData, billing_method_id: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                写真URL
              </label>
              <input
                type="text"
                value={formData.photo_url}
                onChange={(e) =>
                  setFormData({ ...formData, photo_url: e.target.value })
                }
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                備考
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={4}
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-500 disabled:opacity-60"
            >
              {isSubmitting ? "保存中..." : mode === "create" ? "作成" : "更新"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}



