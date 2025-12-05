import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import type { Resident } from "../../api/types";
import { useFacilities } from "../../hooks/useFacilities";

interface ResidentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  resident?: Resident | null;
  mode?: "create" | "edit";
}

export function ResidentFormModal({
  isOpen,
  onClose,
  onSubmit,
  resident,
  mode = "create",
}: ResidentFormModalProps) {
  const { data: facilities } = useFacilities();
  const [formData, setFormData] = useState({
    resident_id: "",
    user_id: "",
    status_id: "",
    facility_id: "",
    last_name: "",
    first_name: "",
    last_name_kana: "",
    first_name_kana: "",
    phone_number: "",
    admission_date: "",
    effective_date: "",
    discharge_date: "",
    is_excluded: false,
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && resident) {
        setFormData({
          resident_id: resident.resident_id || "",
          user_id: resident.user_id || "",
          status_id: resident.status_id || "",
          facility_id: resident.facility_id || "",
          last_name: resident.last_name || "",
          first_name: resident.first_name || "",
          last_name_kana: resident.last_name_kana || "",
          first_name_kana: resident.first_name_kana || "",
          phone_number: resident.phone_number || "",
          admission_date: resident.admission_date ? resident.admission_date.split("T")[0] : "",
          effective_date: resident.effective_date ? resident.effective_date.split("T")[0] : "",
          discharge_date: resident.discharge_date ? resident.discharge_date.split("T")[0] : "",
          is_excluded: resident.is_excluded || false,
          notes: resident.notes || "",
        });
      } else {
        setFormData({
          resident_id: "",
          user_id: "",
          status_id: "",
          facility_id: "",
          last_name: "",
          first_name: "",
          last_name_kana: "",
          first_name_kana: "",
          phone_number: "",
          admission_date: "",
          effective_date: "",
          discharge_date: "",
          is_excluded: false,
          notes: "",
        });
      }
      setErrors({});
    }
  }, [isOpen, resident, mode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (mode === "create" && !formData.resident_id) {
      setErrors({ resident_id: "入所者IDは必須です" });
      return;
    }
    if (!formData.last_name) {
      setErrors({ last_name: "姓は必須です" });
      return;
    }
    if (!formData.first_name) {
      setErrors({ first_name: "名は必須です" });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: any = {
        resident_id: formData.resident_id || null,
        user_id: formData.user_id || null,
        status_id: formData.status_id || null,
        facility_id: formData.facility_id || null,
        last_name: formData.last_name,
        first_name: formData.first_name,
        last_name_kana: formData.last_name_kana || null,
        first_name_kana: formData.first_name_kana || null,
        phone_number: formData.phone_number || null,
        admission_date: formData.admission_date || null,
        effective_date: formData.effective_date || null,
        discharge_date: formData.discharge_date || null,
        is_excluded: formData.is_excluded,
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
            {mode === "create" ? "新規入所者登録" : "入所者編集"}
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
            <div>
              <label className="block text-sm font-medium text-slate-700">
                入所者ID <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.resident_id}
                onChange={(e) =>
                  setFormData({ ...formData, resident_id: e.target.value })
                }
                disabled={mode === "edit"}
                className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm ${
                  errors.resident_id
                    ? "border-rose-500"
                    : "border-slate-300 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                } ${mode === "edit" ? "bg-slate-100" : ""}`}
              />
              {errors.resident_id && (
                <p className="mt-1 text-xs text-rose-600">{errors.resident_id}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                施設
              </label>
              <select
                value={formData.facility_id}
                onChange={(e) =>
                  setFormData({ ...formData, facility_id: e.target.value })
                }
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="">選択してください</option>
                {facilities?.map((facility) => (
                  <option key={facility.facility_id} value={facility.facility_id}>
                    {facility.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  姓 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) =>
                    setFormData({ ...formData, last_name: e.target.value })
                  }
                  className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm ${
                    errors.last_name
                      ? "border-rose-500"
                      : "border-slate-300 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  }`}
                />
                {errors.last_name && (
                  <p className="mt-1 text-xs text-rose-600">{errors.last_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  名 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) =>
                    setFormData({ ...formData, first_name: e.target.value })
                  }
                  className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm ${
                    errors.first_name
                      ? "border-rose-500"
                      : "border-slate-300 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  }`}
                />
                {errors.first_name && (
                  <p className="mt-1 text-xs text-rose-600">{errors.first_name}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  姓（カナ）
                </label>
                <input
                  type="text"
                  value={formData.last_name_kana}
                  onChange={(e) =>
                    setFormData({ ...formData, last_name_kana: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  名（カナ）
                </label>
                <input
                  type="text"
                  value={formData.first_name_kana}
                  onChange={(e) =>
                    setFormData({ ...formData, first_name_kana: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>

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

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  入所日
                </label>
                <input
                  type="date"
                  value={formData.admission_date}
                  onChange={(e) =>
                    setFormData({ ...formData, admission_date: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  発効日
                </label>
                <input
                  type="date"
                  value={formData.effective_date}
                  onChange={(e) =>
                    setFormData({ ...formData, effective_date: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  退所日
                </label>
                <input
                  type="date"
                  value={formData.discharge_date}
                  onChange={(e) =>
                    setFormData({ ...formData, discharge_date: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_excluded"
                checked={formData.is_excluded}
                onChange={(e) =>
                  setFormData({ ...formData, is_excluded: e.target.checked })
                }
                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              <label htmlFor="is_excluded" className="ml-2 text-sm font-medium text-slate-700">
                測定対象外
              </label>
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



