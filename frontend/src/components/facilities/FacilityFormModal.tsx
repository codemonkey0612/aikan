import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import type { Facility } from "../../api/types";
import { useCorporations } from "../../hooks/useCorporations";

interface FacilityFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  facility?: Facility | null;
  mode?: "create" | "edit";
}

export function FacilityFormModal({
  isOpen,
  onClose,
  onSubmit,
  facility,
  mode = "create",
}: FacilityFormModalProps) {
  const { data: corporations } = useCorporations();
  const [formData, setFormData] = useState({
    facility_id: "",
    facility_number: "",
    corporation_id: "",
    name: "",
    name_kana: "",
    postal_code: "",
    address_prefecture: "",
    address_city: "",
    address_building: "",
    latitude_longitude: "",
    phone_number: "",
    facility_status_id: "",
    pre_visit_contact_id: "",
    contact_type_id: "",
    building_type_id: "",
    pl_support_id: "",
    visit_notes: "",
    facility_notes: "",
    user_notes: "",
    map_document_url: "",
    billing_unit_price: "",
    billing_method_id: "",
    capacity: "",
    current_residents: "",
    nurse_id: "",
    visit_count: "",
    prefer_mon: false,
    prefer_tue: false,
    prefer_wed: false,
    prefer_thu: false,
    prefer_fri: false,
    time_mon: "",
    time_tue: "",
    time_wed: "",
    time_thu: "",
    time_fri: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && facility) {
        setFormData({
          facility_id: facility.facility_id || "",
          facility_number: facility.facility_number || "",
          corporation_id: facility.corporation_id || "",
          name: facility.name || "",
          name_kana: facility.name_kana || "",
          postal_code: facility.postal_code || "",
          address_prefecture: facility.address_prefecture || "",
          address_city: facility.address_city || "",
          address_building: facility.address_building || "",
          latitude_longitude: facility.latitude_longitude || "",
          phone_number: facility.phone_number || "",
          facility_status_id: facility.facility_status_id || "",
          pre_visit_contact_id: facility.pre_visit_contact_id || "",
          contact_type_id: facility.contact_type_id || "",
          building_type_id: facility.building_type_id || "",
          pl_support_id: facility.pl_support_id || "",
          visit_notes: facility.visit_notes || "",
          facility_notes: facility.facility_notes || "",
          user_notes: facility.user_notes || "",
          map_document_url: facility.map_document_url || "",
          billing_unit_price: facility.billing_unit_price?.toString() || "",
          billing_method_id: facility.billing_method_id || "",
          capacity: facility.capacity?.toString() || "",
          current_residents: facility.current_residents?.toString() || "",
          nurse_id: facility.nurse_id || "",
          visit_count: facility.visit_count?.toString() || "",
          prefer_mon: facility.prefer_mon || false,
          prefer_tue: facility.prefer_tue || false,
          prefer_wed: facility.prefer_wed || false,
          prefer_thu: facility.prefer_thu || false,
          prefer_fri: facility.prefer_fri || false,
          time_mon: facility.time_mon || "",
          time_tue: facility.time_tue || "",
          time_wed: facility.time_wed || "",
          time_thu: facility.time_thu || "",
          time_fri: facility.time_fri || "",
        });
      } else {
        setFormData({
          facility_id: "",
          facility_number: "",
          corporation_id: "",
          name: "",
          name_kana: "",
          postal_code: "",
          address_prefecture: "",
          address_city: "",
          address_building: "",
          latitude_longitude: "",
          phone_number: "",
          facility_status_id: "",
          pre_visit_contact_id: "",
          contact_type_id: "",
          building_type_id: "",
          pl_support_id: "",
          visit_notes: "",
          facility_notes: "",
          user_notes: "",
          map_document_url: "",
          billing_unit_price: "",
          billing_method_id: "",
          capacity: "",
          current_residents: "",
          nurse_id: "",
          visit_count: "",
          prefer_mon: false,
          prefer_tue: false,
          prefer_wed: false,
          prefer_thu: false,
          prefer_fri: false,
          time_mon: "",
          time_tue: "",
          time_wed: "",
          time_thu: "",
          time_fri: "",
        });
      }
      setErrors({});
    }
  }, [isOpen, facility, mode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (mode === "create" && !formData.facility_id) {
      setErrors({ facility_id: "施設IDは必須です" });
      return;
    }
    if (!formData.name) {
      setErrors({ name: "施設名は必須です" });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: any = {
        facility_id: formData.facility_id || null,
        facility_number: formData.facility_number || null,
        corporation_id: formData.corporation_id || null,
        name: formData.name,
        name_kana: formData.name_kana || null,
        postal_code: formData.postal_code || null,
        address_prefecture: formData.address_prefecture || null,
        address_city: formData.address_city || null,
        address_building: formData.address_building || null,
        latitude_longitude: formData.latitude_longitude || null,
        phone_number: formData.phone_number || null,
        facility_status_id: formData.facility_status_id || null,
        pre_visit_contact_id: formData.pre_visit_contact_id || null,
        contact_type_id: formData.contact_type_id || null,
        building_type_id: formData.building_type_id || null,
        pl_support_id: formData.pl_support_id || null,
        visit_notes: formData.visit_notes || null,
        facility_notes: formData.facility_notes || null,
        user_notes: formData.user_notes || null,
        map_document_url: formData.map_document_url || null,
        billing_unit_price: formData.billing_unit_price ? parseFloat(formData.billing_unit_price) : null,
        billing_method_id: formData.billing_method_id || null,
        capacity: formData.capacity ? parseInt(formData.capacity) : null,
        current_residents: formData.current_residents ? parseInt(formData.current_residents) : null,
        nurse_id: formData.nurse_id || null,
        visit_count: formData.visit_count ? parseInt(formData.visit_count) : null,
        prefer_mon: formData.prefer_mon,
        prefer_tue: formData.prefer_tue,
        prefer_wed: formData.prefer_wed,
        prefer_thu: formData.prefer_thu,
        prefer_fri: formData.prefer_fri,
        time_mon: formData.time_mon || null,
        time_tue: formData.time_tue || null,
        time_wed: formData.time_wed || null,
        time_thu: formData.time_thu || null,
        time_fri: formData.time_fri || null,
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
      <div className="w-full max-w-4xl rounded-lg bg-white shadow-xl my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">
            {mode === "create" ? "新規施設登録" : "施設編集"}
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
                  施設ID <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.facility_id}
                  onChange={(e) =>
                    setFormData({ ...formData, facility_id: e.target.value })
                  }
                  disabled={mode === "edit"}
                  className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm ${
                    errors.facility_id
                      ? "border-rose-500"
                      : "border-slate-300 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  } ${mode === "edit" ? "bg-slate-100" : ""}`}
                />
                {errors.facility_id && (
                  <p className="mt-1 text-xs text-rose-600">{errors.facility_id}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  施設番号
                </label>
                <input
                  type="text"
                  value={formData.facility_number}
                  onChange={(e) =>
                    setFormData({ ...formData, facility_number: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                法人
              </label>
              <select
                value={formData.corporation_id}
                onChange={(e) =>
                  setFormData({ ...formData, corporation_id: e.target.value })
                }
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="">選択してください</option>
                {corporations?.map((corp) => (
                  <option key={corp.corporation_id} value={corp.corporation_id}>
                    {corp.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  施設名 <span className="text-rose-500">*</span>
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
                  施設名（カナ）
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  定員
                </label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData({ ...formData, capacity: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  現在の入所者数
                </label>
                <input
                  type="number"
                  value={formData.current_residents}
                  onChange={(e) =>
                    setFormData({ ...formData, current_residents: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                備考（訪問時）
              </label>
              <textarea
                value={formData.visit_notes}
                onChange={(e) =>
                  setFormData({ ...formData, visit_notes: e.target.value })
                }
                rows={3}
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                備考（施設）
              </label>
              <textarea
                value={formData.facility_notes}
                onChange={(e) =>
                  setFormData({ ...formData, facility_notes: e.target.value })
                }
                rows={3}
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



