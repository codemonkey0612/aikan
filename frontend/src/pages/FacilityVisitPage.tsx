import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getFacilityById } from "../api/facilities";
import { useResidents } from "../hooks/useResidents";
import { useVitals, useCreateVital, useUpdateVital, useDeleteVital } from "../hooks/useVitals";
import { useAuth } from "../hooks/useAuth";
import { useUsers } from "../hooks/useUsers";
import { useCorporations } from "../hooks/useCorporations";
import { Card } from "../components/ui/Card";
import { FacilityImage } from "../components/shifts/FacilityImage";
import { GoogleMapComponent } from "../components/maps/GoogleMap";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from "../components/ui/Table";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import {
  ArrowLeftIcon,
  BuildingOffice2Icon,
  UserGroupIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  MapPinIcon,
  XMarkIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import type { VitalRecord, Resident } from "../api/types";
import toast from "react-hot-toast";

// Normalize facility ID for comparison
const normalizeFacilityId = (id: string | number | null | undefined): string => {
  if (id === null || id === undefined) return '';
  return String(id).trim().replace(/\r\n/g, '').replace(/\n/g, '').replace(/\r/g, '');
};

// Format date/time for display
const formatDateTime = (dateString: string | null | undefined): string => {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    return date.toLocaleString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
};

interface VitalFormData {
  temperature: string;
  pulse: string;
  systolic_bp: string;
  diastolic_bp: string;
  spo2: string;
  climax: string;
  food: string;
  sleep: string;
  note: string;
  measured_at: string;
}

// Format enum values to Japanese
const formatClimax = (value: string | null | undefined): string => {
  if (!value) return "-";
  const map: Record<string, string> = {
    very_good: "とても良い",
    good: "良い",
    average: "普通",
    not_very_good: "あまり良くない",
    very_bad: "とても悪い",
  };
  return map[value] || value;
};

const formatFood = (value: string | null | undefined): string => {
  if (!value) return "-";
  const map: Record<string, string> = {
    sufficient: "十分",
    almost_sufficient: "ほぼ十分",
    half_sufficient: "半分程度",
    not_much: "あまり取れていない",
    almost_none: "ほとんど取れていない",
  };
  return map[value] || value;
};

const formatSleep = (value: string | null | undefined): string => {
  if (!value) return "-";
  const map: Record<string, string> = {
    sufficient: "十分（7時間以上）",
    almost_sufficient: "ほぼ十分（6-7時間）",
    slightly_insufficient: "やや不足（5-6時間）",
    considerably_insufficient: "かなり不足（4-5時間）",
    very_insufficient: "非常に不足（4時間未満）",
  };
  return map[value] || value;
};

// Get vital type badge (著変なし or other status)
const getVitalTypeBadge = (vital: VitalRecord | undefined): string => {
  if (!vital) return "未記録";
  // For now, always show "著変なし" if vital exists
  return "著変なし";
};

export function FacilityVisitPage() {
  const { facilityId, date, nurseId } = useParams<{ facilityId: string; date?: string; nurseId?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: users } = useUsers();
  const { data: corporations } = useCorporations();
  const userList = useMemo(() => Array.isArray(users) ? users : users?.data || [], [users]);

  // Get facility data
  const { data: facility, isLoading: facilityLoading } = useQuery({
    queryKey: ["facility", facilityId],
    queryFn: () => getFacilityById(facilityId!).then((res) => res.data),
    enabled: !!facilityId,
  });

  // Get all residents
  const { data: allResidents } = useResidents();

  // Filter residents for this facility (currently admitted only)
  const currentResidents = useMemo(() => {
    if (!allResidents || !facility?.facility_id) return [];
    
    const normalizedFacilityId = normalizeFacilityId(facility.facility_id);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return allResidents.filter((resident) => {
      const residentFacilityId = normalizeFacilityId(resident.facility_id);
      if (residentFacilityId !== normalizedFacilityId) return false;
      if (resident.is_excluded) return false;
      if (!resident.admission_date) return false;
      if (resident.discharge_date) {
        const dischargeDate = new Date(resident.discharge_date);
        dischargeDate.setHours(0, 0, 0, 0);
        return dischargeDate > today;
      }
      return true;
    });
  }, [allResidents, facility?.facility_id]);

  // Get vitals for all residents in this facility
  const { data: vitalsData } = useVitals({
    limit: 1000, // Get all vitals
  });

  // Get vitals for each resident (most recent)
  const residentVitalsMap = useMemo(() => {
    const map = new Map<string, VitalRecord>();
    if (!vitalsData?.data) return map;

    vitalsData.data.forEach((vital) => {
      const existing = map.get(vital.resident_id);
      if (!existing || (vital.created_at > existing.created_at)) {
        map.set(vital.resident_id, vital);
      }
    });

    return map;
  }, [vitalsData]);

  const createVitalMutation = useCreateVital();
  const updateVitalMutation = useUpdateVital();
  const deleteVitalMutation = useDeleteVital();

  // Modal state
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  // Convert ISO string to datetime-local format (helper function defined later)
  const getInitialDateTimeLocal = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const [formData, setFormData] = useState<VitalFormData>({
    temperature: "",
    pulse: "",
    systolic_bp: "",
    diastolic_bp: "",
    spo2: "",
    climax: "",
    food: "",
    sleep: "",
    note: "",
    measured_at: getInitialDateTimeLocal(),
  });

  // Get nurse info
  const nurse = useMemo(() => {
    if (!nurseId) return userList.find((u) => u.id === user?.id);
    return userList.find((u) => u.nurse_id === nurseId);
  }, [userList, nurseId, user?.id]);

  // Get corporation
  const corporation = useMemo(() => {
    if (!facility?.corporation_id) return null;
    return corporations?.find((c) => c.corporation_id === facility.corporation_id);
  }, [corporations, facility?.corporation_id]);

  // Convert datetime-local format to ISO string
  const convertToISOString = (datetimeLocal: string): string => {
    if (!datetimeLocal) return new Date().toISOString();
    // datetime-local format: "YYYY-MM-DDTHH:mm"
    // Convert to ISO: "YYYY-MM-DDTHH:mm:ss.sssZ"
    const date = new Date(datetimeLocal);
    return date.toISOString();
  };

  // Convert ISO string to datetime-local format
  const convertToDateTimeLocal = (isoString: string | null | undefined): string => {
    if (!isoString) {
      const now = new Date();
      return now.toISOString().slice(0, 16);
    }
    try {
      const date = new Date(isoString);
      // Format as YYYY-MM-DDTHH:mm for datetime-local input
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch {
      return new Date().toISOString().slice(0, 16);
    }
  };

  // Open modal for resident
  const openResidentModal = (resident: Resident) => {
    try {
      console.log("=== Opening modal for resident ===");
      console.log("Resident:", resident);
      console.log("Resident ID:", resident.resident_id);
      
      setSelectedResident(resident);
      const existingVital = residentVitalsMap.get(resident.resident_id);
      console.log("Existing vital:", existingVital);
      
      if (existingVital) {
        console.log("Found existing vital, setting form data");
        setFormData({
          temperature: existingVital.temperature?.toString() || "",
          pulse: existingVital.pulse?.toString() || "",
          systolic_bp: existingVital.systolic_bp?.toString() || "",
          diastolic_bp: existingVital.diastolic_bp?.toString() || "",
          spo2: existingVital.spo2?.toString() || "",
          climax: existingVital.climax || "",
          food: existingVital.food || "",
          sleep: existingVital.sleep || "",
          note: existingVital.note || "",
          measured_at: convertToDateTimeLocal(existingVital.measured_at || existingVital.created_at),
        });
        setIsEditing(false); // Start in view mode if vital exists
        console.log("Set isEditing to false");
      } else {
        console.log("No existing vital, initializing empty form");
        const now = new Date();
        setFormData({
          temperature: "",
          pulse: "",
          systolic_bp: "",
          diastolic_bp: "",
          spo2: "",
          climax: "",
          food: "",
          sleep: "",
          note: "",
          measured_at: convertToDateTimeLocal(now.toISOString()),
        });
        setIsEditing(true); // Start in edit mode if no vital exists (to allow adding)
        console.log("Set isEditing to true");
      }
      
      console.log("Setting isModalOpen to true");
      setIsModalOpen(true);
      
      // Double check after a brief delay
      setTimeout(() => {
        console.log("Modal state check - isModalOpen should be true");
      }, 100);
    } catch (error) {
      console.error("Error opening modal:", error);
      toast.error("モーダルを開く際にエラーが発生しました");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedResident(null);
    setIsEditing(false);
    // Reset form data
    setFormData({
      temperature: "",
      pulse: "",
      systolic_bp: "",
      diastolic_bp: "",
      spo2: "",
      climax: "",
      food: "",
      sleep: "",
      note: "",
      measured_at: getInitialDateTimeLocal(),
    });
  };

  const handleSubmit = async () => {
    console.log("handleSubmit called");
    if (!selectedResident) {
      console.error("No selected resident");
      toast.error("入居者が選択されていません");
      return;
    }

    const existingVital = residentVitalsMap.get(selectedResident.resident_id);
    console.log("Existing vital:", existingVital);

    // Convert datetime-local to ISO string
    const measuredAtISO = convertToISOString(formData.measured_at);
    console.log("Converted measured_at:", measuredAtISO);

    // Helper to parse number or return null
    const parseNumber = (value: string): number | null => {
      if (!value || value.trim() === "") return null;
      const parsed = parseFloat(value);
      return isNaN(parsed) ? null : parsed;
    };

    // Helper to parse integer or return null
    const parseIntSafe = (value: string): number | null => {
      if (!value || value.trim() === "") return null;
      const parsed = parseInt(value, 10);
      return isNaN(parsed) ? null : parsed;
    };

    const vitalData: Partial<VitalRecord> = {
      resident_id: selectedResident.resident_id,
      measured_at: measuredAtISO,
      temperature: parseNumber(formData.temperature),
      pulse: parseIntSafe(formData.pulse),
      systolic_bp: parseIntSafe(formData.systolic_bp),
      diastolic_bp: parseIntSafe(formData.diastolic_bp),
      spo2: parseIntSafe(formData.spo2),
      climax: formData.climax && formData.climax.trim() ? formData.climax as any : null,
      food: formData.food && formData.food.trim() ? formData.food as any : null,
      sleep: formData.sleep && formData.sleep.trim() ? formData.sleep as any : null,
      note: formData.note && formData.note.trim() ? formData.note.trim() : null,
      created_by: user?.id || null,
    };

    console.log("Vital data to send:", vitalData);
    console.log("User ID:", user?.id);

    // Validate required fields
    if (!vitalData.resident_id) {
      toast.error("入居者IDが設定されていません");
      return;
    }

    if (!vitalData.measured_at) {
      toast.error("実施日時を入力してください");
      return;
    }

    try {
      if (existingVital) {
        console.log("Updating vital with ID:", existingVital.id);
        const result = await updateVitalMutation.mutateAsync({
          id: existingVital.id,
          data: vitalData,
        });
        console.log("Update result:", result);
        toast.success("バイタル情報を更新しました");
      } else {
        console.log("Creating new vital");
        const result = await createVitalMutation.mutateAsync(vitalData);
        console.log("Create result:", result);
        toast.success("バイタル情報を登録しました");
      }
      closeModal();
    } catch (error: any) {
      console.error("Vital submit error:", error);
      console.error("Error response:", error?.response);
      console.error("Error response data:", error?.response?.data);
      console.error("Vital data sent:", vitalData);
      
      // Extract detailed error message
      let errorMessage = "エラーが発生しました";
      if (error?.response?.data) {
        const errorData = error.response.data;
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (Array.isArray(errorData)) {
          errorMessage = errorData.map((e: any) => e.message || e).join(", ");
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      console.error("Final error message:", errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleDelete = async () => {
    if (!selectedResident) return;
    const existingVital = residentVitalsMap.get(selectedResident.resident_id);
    if (!existingVital) return;

    if (!confirm("このバイタル記録を削除しますか？")) return;

    try {
      await deleteVitalMutation.mutateAsync(existingVital.id);
      toast.success("バイタル情報を削除しました");
      closeModal();
    } catch (error: any) {
      toast.error(error?.message || "エラーが発生しました");
    }
  };

  if (facilityLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-500">読み込み中...</p>
      </div>
    );
  }

  if (!facility) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-slate-500 mb-4">施設が見つかりませんでした。</p>
          <button
            onClick={() => navigate(-1)}
            className="text-brand-600 hover:text-brand-700"
          >
            戻る
          </button>
        </div>
      </div>
    );
  }

  const visitDate = date ? new Date(date) : new Date();
  const dateLabel = visitDate.toLocaleDateString("ja-JP", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Parse coordinates for map
  const [lat, lng] = facility.latitude_longitude
    ? facility.latitude_longitude.split(",").map((s: string) => s.trim())
    : [null, null];

  const address = [
    facility.address_prefecture,
    facility.address_city,
    facility.address_building,
  ]
    .filter(Boolean)
    .join(" ");

  const selectedVital = selectedResident
    ? residentVitalsMap.get(selectedResident.resident_id)
    : null;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-brand-600 transition-colors"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              <span>戻る</span>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{facility.name}</h1>
              {facility.name_kana && (
                <p className="text-sm text-slate-500">({facility.name_kana})</p>
              )}
            </div>
          </div>
          {nurse && (
            <div className="text-sm text-slate-600">
              <p className="font-semibold">看護師: {nurse.last_name} {nurse.first_name}</p>
              <p className="text-xs">{dateLabel}</p>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Residents Vitals Table - Top Section */}
        <Card title="バイタル一覧">
          {currentResidents.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <UserGroupIcon className="h-12 w-12 mx-auto mb-2 text-slate-400" />
              <p>現在入所している入居者はいません</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHeaderCell>氏名</TableHeaderCell>
                    <TableHeaderCell>バイタル種別</TableHeaderCell>
                    <TableHeaderCell>体温</TableHeaderCell>
                    <TableHeaderCell>脈拍</TableHeaderCell>
                    <TableHeaderCell>最低血圧</TableHeaderCell>
                    <TableHeaderCell>最高血圧</TableHeaderCell>
                    <TableHeaderCell>酸素飽和度</TableHeaderCell>
                    <TableHeaderCell>気分</TableHeaderCell>
                    <TableHeaderCell>食事</TableHeaderCell>
                    <TableHeaderCell>睡眠</TableHeaderCell>
                    <TableHeaderCell>備考</TableHeaderCell>
                    <TableHeaderCell>実施日時</TableHeaderCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentResidents.map((resident) => {
                    const vital = residentVitalsMap.get(resident.resident_id);
                    const vitalType = getVitalTypeBadge(vital);

                    return (
                      <TableRow
                        key={resident.resident_id}
                        className="cursor-pointer hover:bg-slate-50 transition-colors active:bg-slate-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log("=== Table Row Clicked ===");
                          console.log("Resident:", resident);
                          console.log("Resident ID:", resident.resident_id);
                          console.log("Current modal state:", isModalOpen);
                          openResidentModal(resident);
                        }}
                      >
                        <TableCell className="font-medium">
                          {resident.last_name} {resident.first_name}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium bg-pink-100 text-pink-700">
                            {vitalType}
                          </span>
                        </TableCell>
                        <TableCell>
                          {vital?.temperature ? `${vital.temperature}°C` : "-"}
                        </TableCell>
                        <TableCell>
                          {vital?.pulse ? `${vital.pulse}回/分` : "-"}
                        </TableCell>
                        <TableCell>
                          {vital?.diastolic_bp ? `${vital.diastolic_bp} mmHg` : "-"}
                        </TableCell>
                        <TableCell>
                          {vital?.systolic_bp ? `${vital.systolic_bp} mmHg` : "-"}
                        </TableCell>
                        <TableCell>
                          {vital?.spo2 ? `${vital.spo2}%` : "-"}
                        </TableCell>
                        <TableCell>
                          {formatClimax(vital?.climax)}
                        </TableCell>
                        <TableCell>
                          {formatFood(vital?.food)}
                        </TableCell>
                        <TableCell>
                          {formatSleep(vital?.sleep)}
                        </TableCell>
                        <TableCell>
                          {vital?.note || "-"}
                        </TableCell>
                        <TableCell>
                          {formatDateTime(vital?.measured_at || vital?.created_at)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>

        {/* Facility Information - Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="施設情報">
            <div className="space-y-4">
              {facility.facility_id && (
                <div className="flex gap-4">
                  <FacilityImage
                    facilityId={facility.facility_id}
                    alt={facility.name || ""}
                    className="h-24 w-24 rounded-lg object-cover border border-slate-200 flex-shrink-0"
                  />
                  <div className="flex-1">
                    {corporation && (
                      <p className="text-sm text-slate-600 mb-1">
                        <span className="font-medium">法人名:</span> {corporation.name}
                      </p>
                    )}
                    {facility.postal_code && (
                      <p className="text-sm text-slate-600 mb-1">
                        <span className="font-medium">郵便番号:</span> 〒{facility.postal_code}
                      </p>
                    )}
                  </div>
                </div>
              )}
              {facility.address_prefecture && (
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-1">都道府県</p>
                  <p className="text-sm text-slate-600">{facility.address_prefecture}</p>
                </div>
              )}
              {address && (
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-1">市区町村・番地</p>
                  <p className="text-sm text-slate-600">{address}</p>
                </div>
              )}
              {facility.phone_number && (
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-1">電話番号</p>
                  <div className="flex items-center gap-2">
                    <PhoneIcon className="h-4 w-4 text-slate-400" />
                    <span className="text-sm text-slate-600">{facility.phone_number}</span>
                    <button className="p-1 text-slate-400 hover:text-slate-600">
                      <ChatBubbleLeftRightIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Map */}
          {lat && lng && (
            <Card title="地図">
              <div className="space-y-4">
                <div className="w-full rounded-lg border border-slate-200 overflow-hidden">
                  <GoogleMapComponent
                    lat={parseFloat(lat)}
                    lng={parseFloat(lng)}
                    height="300px"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-600 font-mono bg-slate-50 px-2 py-1 rounded border border-slate-200">
                    {lat}, {lng}
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Nurse Information */}
        {nurse && (
          <Card title="看護師情報">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-lg">
                {nurse.last_name.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-slate-900">
                  氏名: {nurse.last_name} {nurse.first_name}
                </p>
                {nurse.nurse_id && (
                  <p className="text-sm text-slate-500">看護師ID: {nurse.nurse_id}</p>
                )}
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Resident Vital Detail Modal */}
      {isModalOpen && (
        <Transition appear show={isModalOpen} as={Fragment}>
          <Dialog as="div" className="relative z-50" onClose={closeModal} open={isModalOpen}>
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
                  <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-gradient-to-r from-pink-50 to-rose-50">
                    <Dialog.Title className="text-xl font-bold text-slate-900">
                      {selectedResident
                        ? `${selectedResident.last_name} ${selectedResident.first_name}`
                        : ""}
                    </Dialog.Title>
                    <button
                      onClick={closeModal}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="px-6 py-4 space-y-6 max-h-[70vh] overflow-y-auto">
                    {selectedResident && (
                      <>
                        {/* Resident Profile */}
                        <div className="flex items-center gap-4 pb-4 border-b border-slate-200">
                          <div className="h-16 w-16 rounded-full bg-blue-100 border-2 border-red-200 flex items-center justify-center">
                            <UserGroupIcon className="h-8 w-8 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-lg text-slate-900">
                              {selectedResident.last_name} {selectedResident.first_name}
                            </p>
                            {selectedResident.last_name_kana && selectedResident.first_name_kana && (
                              <p className="text-sm text-slate-500">
                                ({selectedResident.last_name_kana} {selectedResident.first_name_kana})
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {!isEditing && (
                              <button
                                onClick={() => setIsEditing(true)}
                                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-pink-600 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors"
                              >
                                <PencilIcon className="h-4 w-4" />
                                {selectedVital ? "変更" : "追加"}
                              </button>
                            )}
                            {selectedVital && !isEditing && (
                              <button
                                onClick={handleDelete}
                                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                              >
                                <TrashIcon className="h-4 w-4" />
                                削除
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Basic Information */}
                        <div>
                          <h3 className="text-sm font-semibold text-slate-700 mb-3">基本情報</h3>
                          {isEditing ? (
                            <div className="space-y-3">
                              <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                  実施日時
                                </label>
                                <input
                                  type="datetime-local"
                                  value={formData.measured_at}
                                  onChange={(e) => setFormData({ ...formData, measured_at: e.target.value })}
                                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                  入所者名
                                </label>
                                <p className="text-sm text-slate-900">
                                  {selectedResident.last_name} {selectedResident.first_name}
                                </p>
                              </div>
                              {nurse && (
                                <div>
                                  <label className="block text-sm font-medium text-slate-700 mb-1">
                                    看護師名
                                  </label>
                                  <p className="text-sm text-slate-900">
                                    {nurse.last_name} {nurse.first_name}
                                  </p>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-2 text-sm">
                              <div className="flex">
                                <span className="w-24 text-slate-500">実施日時:</span>
                                <span className="text-slate-900">
                                  {selectedVital
                                    ? formatDateTime(selectedVital.measured_at || selectedVital.created_at)
                                    : formatDateTime(new Date().toISOString())}
                                </span>
                              </div>
                              <div className="flex">
                                <span className="w-24 text-slate-500">入所者名:</span>
                                <span className="text-slate-900">
                                  {selectedResident.last_name} {selectedResident.first_name}
                                </span>
                              </div>
                              {nurse && (
                                <div className="flex">
                                  <span className="w-24 text-slate-500">看護師名:</span>
                                  <span className="text-slate-900">
                                    {nurse.last_name} {nurse.first_name}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Vital Information */}
                        <div>
                          <h3 className="text-sm font-semibold text-slate-700 mb-3">バイタル情報</h3>
                          {isEditing ? (
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                  体温 (°C)
                                </label>
                                <input
                                  type="number"
                                  step="0.1"
                                  value={formData.temperature}
                                  onChange={(e) =>
                                    setFormData({ ...formData, temperature: e.target.value })
                                  }
                                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                                  placeholder="36.5"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                  脈拍 (回/分)
                                </label>
                                <input
                                  type="number"
                                  value={formData.pulse}
                                  onChange={(e) =>
                                    setFormData({ ...formData, pulse: e.target.value })
                                  }
                                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                                  placeholder="80"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                  血圧高 (mmHg)
                                </label>
                                <input
                                  type="number"
                                  value={formData.systolic_bp}
                                  onChange={(e) =>
                                    setFormData({ ...formData, systolic_bp: e.target.value })
                                  }
                                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                                  placeholder="120"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                  血圧低 (mmHg)
                                </label>
                                <input
                                  type="number"
                                  value={formData.diastolic_bp}
                                  onChange={(e) =>
                                    setFormData({ ...formData, diastolic_bp: e.target.value })
                                  }
                                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                                  placeholder="80"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                  酸素飽和度 (%)
                                </label>
                                <input
                                  type="number"
                                  value={formData.spo2}
                                  onChange={(e) =>
                                    setFormData({ ...formData, spo2: e.target.value })
                                  }
                                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                                  placeholder="98"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                  気分
                                </label>
                                <select
                                  value={formData.climax}
                                  onChange={(e) =>
                                    setFormData({ ...formData, climax: e.target.value })
                                  }
                                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                                >
                                  <option value="">選択してください</option>
                                  <option value="very_good">とても良い</option>
                                  <option value="good">良い</option>
                                  <option value="average">普通</option>
                                  <option value="not_very_good">あまり良くない</option>
                                  <option value="very_bad">とても悪い</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                  食事
                                </label>
                                <select
                                  value={formData.food}
                                  onChange={(e) =>
                                    setFormData({ ...formData, food: e.target.value })
                                  }
                                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                                >
                                  <option value="">選択してください</option>
                                  <option value="sufficient">十分</option>
                                  <option value="almost_sufficient">ほぼ十分</option>
                                  <option value="half_sufficient">半分程度</option>
                                  <option value="not_much">あまり取れていない</option>
                                  <option value="almost_none">ほとんど取れていない</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                  睡眠
                                </label>
                                <select
                                  value={formData.sleep}
                                  onChange={(e) =>
                                    setFormData({ ...formData, sleep: e.target.value })
                                  }
                                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                                >
                                  <option value="">選択してください</option>
                                  <option value="sufficient">十分（7時間以上）</option>
                                  <option value="almost_sufficient">ほぼ十分（6-7時間）</option>
                                  <option value="slightly_insufficient">やや不足（5-6時間）</option>
                                  <option value="considerably_insufficient">かなり不足（4-5時間）</option>
                                  <option value="very_insufficient">非常に不足（4時間未満）</option>
                                </select>
                              </div>
                              <div className="col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                  備考
                                </label>
                                <textarea
                                  value={formData.note}
                                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                                  rows={2}
                                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                                  placeholder="備考を入力してください"
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2 text-sm">
                              <div className="flex">
                                <span className="w-24 text-slate-500">体温:</span>
                                <span className="text-slate-900">
                                  {selectedVital?.temperature
                                    ? `${selectedVital.temperature}°C`
                                    : "-"}
                                </span>
                              </div>
                              <div className="flex">
                                <span className="w-24 text-slate-500">脈拍:</span>
                                <span className="text-slate-900">
                                  {selectedVital?.pulse
                                    ? `${selectedVital.pulse}回/分`
                                    : "-"}
                                </span>
                              </div>
                              <div className="flex">
                                <span className="w-24 text-slate-500">血圧高:</span>
                                <span className="text-slate-900">
                                  {selectedVital?.systolic_bp
                                    ? `${selectedVital.systolic_bp} mmHg`
                                    : "-"}
                                </span>
                              </div>
                              <div className="flex">
                                <span className="w-24 text-slate-500">血圧低:</span>
                                <span className="text-slate-900">
                                  {selectedVital?.diastolic_bp
                                    ? `${selectedVital.diastolic_bp} mmHg`
                                    : "-"}
                                </span>
                              </div>
                              <div className="flex">
                                <span className="w-24 text-slate-500">酸素飽和度:</span>
                                <span className="text-slate-900">
                                  {selectedVital?.spo2
                                    ? `${selectedVital.spo2}%`
                                    : "-"}
                                </span>
                              </div>
                              <div className="flex">
                                <span className="w-24 text-slate-500">気分:</span>
                                <span className="text-slate-900">
                                  {formatClimax(selectedVital?.climax)}
                                </span>
                              </div>
                              <div className="flex">
                                <span className="w-24 text-slate-500">食事:</span>
                                <span className="text-slate-900">
                                  {formatFood(selectedVital?.food)}
                                </span>
                              </div>
                              <div className="flex">
                                <span className="w-24 text-slate-500">睡眠:</span>
                                <span className="text-slate-900">
                                  {formatSleep(selectedVital?.sleep)}
                                </span>
                              </div>
                              <div className="flex">
                                <span className="w-24 text-slate-500">備考:</span>
                                <span className="text-slate-900">{selectedVital?.note || "-"}</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        {isEditing && (
                          <div className="flex gap-2 justify-end pt-4 border-t border-slate-200">
                            <button
                              onClick={closeModal}
                              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                            >
                              キャンセル
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log("Submit button clicked");
                                console.log("Form data:", formData);
                                console.log("Selected resident:", selectedResident);
                                handleSubmit();
                              }}
                              disabled={
                                createVitalMutation.isPending || updateVitalMutation.isPending
                              }
                              className="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {createVitalMutation.isPending || updateVitalMutation.isPending
                                ? "処理中..."
                                : selectedVital
                                ? "更新"
                                : "登録"}
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
      )}
    </div>
  );
}

