import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import { getFacilityById } from "../api/facilities";
import { useCorporations } from "../hooks/useCorporations";
import { Card } from "../components/ui/Card";
import { GoogleMapComponent } from "../components/maps/GoogleMap";
import {
  ArrowLeftIcon,
  BuildingOffice2Icon,
  MapPinIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  ClipboardDocumentIcon,
} from "@heroicons/react/24/outline";
import type { Facility } from "../api/types";

export function FacilityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: corporations } = useCorporations();

  const { data: facility, isLoading } = useQuery({
    queryKey: ["facility", id],
    queryFn: () => getFacilityById(id!).then((res) => res.data),
    enabled: !!id,
  });

  if (isLoading) {
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
            onClick={() => navigate("/facilities")}
            className="text-brand-600 hover:text-brand-700"
          >
            一覧に戻る
          </button>
        </div>
      </div>
    );
  }

  const corporation = corporations?.find(
    (c) => c.corporation_id === facility.corporation_id
  );

  const address = [
    facility.address_prefecture,
    facility.address_city,
    facility.address_building,
  ]
    .filter(Boolean)
    .join(" ");

  const [lat, lng] = facility.latitude_longitude
    ? facility.latitude_longitude.split(",").map((s: string) => s.trim())
    : [null, null];

  const copyAddressToClipboard = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast.success("住所をクリップボードにコピーしました");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <header>
        <button
          onClick={() => navigate("/facilities")}
          className="mb-4 inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          一覧に戻る
        </button>
        <div className="flex items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
            <BuildingOffice2Icon className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">
              {facility.name || "名称未設定"}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {facility.facility_id}
            </p>
          </div>
        </div>
      </header>

      {/* Facility Information */}
      <Card title="施設情報">
        <div className="space-y-4">
          {corporation && (
            <div>
              <p className="text-sm font-medium text-slate-700">法人名</p>
              <p className="text-sm text-slate-600 mt-1">{corporation.name}</p>
            </div>
          )}
          {facility.pl_support_id && (
            <div>
              <p className="text-sm font-medium text-slate-700">PL対応</p>
              <p className="text-sm text-slate-600 mt-1">
                {facility.pl_support_id === "completed" ? "PL完了" : facility.pl_support_id}
              </p>
            </div>
          )}
          {facility.building_type_id && (
            <div>
              <p className="text-sm font-medium text-slate-700">建物タイプ</p>
              <p className="text-sm text-slate-600 mt-1">
                {facility.building_type_id}
              </p>
            </div>
          )}
          {facility.postal_code && (
            <div>
              <p className="text-sm font-medium text-slate-700">郵便番号</p>
              <p className="text-sm text-slate-600 mt-1">
                〒{facility.postal_code}
              </p>
            </div>
          )}
          {facility.address_prefecture && (
            <div>
              <p className="text-sm font-medium text-slate-700">
                都道府県
              </p>
              <p className="text-sm text-slate-600 mt-1">
                {facility.address_prefecture}
              </p>
            </div>
          )}
          {address && (
            <div>
              <p className="text-sm font-medium text-slate-700">
                市区町村・番地
              </p>
              <p className="text-sm text-slate-600 mt-1">{address}</p>
              <button
                onClick={copyAddressToClipboard}
                className="mt-2 text-sm text-brand-600 hover:text-brand-700"
              >
                住所をクリップボードにコピー
              </button>
            </div>
          )}
          {facility.phone_number && (
            <div>
              <p className="text-sm font-medium text-slate-700">
                事前連絡電話番号
              </p>
              <div className="flex items-center gap-2 mt-1">
                <PhoneIcon className="h-4 w-4 text-slate-400" />
                <span className="text-sm text-slate-600">
                  {facility.phone_number}
                </span>
                <button className="p-1 text-slate-400 hover:text-slate-600">
                  <ChatBubbleLeftRightIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
          {facility.phone_number && (
            <div>
              <p className="text-sm font-medium text-slate-700">
                緊急連絡先電話番号
              </p>
              <div className="flex items-center gap-2 mt-1">
                <PhoneIcon className="h-4 w-4 text-slate-400" />
                <span className="text-sm text-slate-600">
                  {facility.phone_number}
                </span>
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
                height="400px"
              />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-600 font-mono bg-red-50 px-2 py-1 rounded border border-red-200">
                {lat}, {lng}
              </p>
              <button className="text-sm text-brand-600 hover:text-brand-700">
                座標修正
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Billing Information */}
      <Card title="請求情報">
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-slate-700">定員</p>
            <p className="text-sm text-slate-600 mt-1">
              {facility.capacity ?? "-"}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700">入居者数</p>
            <p className="text-sm text-slate-600 mt-1">
              {facility.current_residents ?? "-"}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700">請求方法</p>
            <p className="text-sm text-slate-600 mt-1">
              {corporation ? "法人ごと" : "-"}
            </p>
          </div>
        </div>
      </Card>

      {/* Access Intelligence */}
      <Card title="アクセス情報">
        <div className="space-y-4">
          {facility.pre_visit_contact_id && (
            <div>
              <p className="text-sm font-medium text-slate-700">
                訪問前連絡
              </p>
              <p className="text-sm text-slate-600 mt-1">
                {facility.pre_visit_contact_id}
              </p>
            </div>
          )}
          {facility.contact_type_id && (
            <div>
              <p className="text-sm font-medium text-slate-700">連絡タイプ</p>
              <p className="text-sm text-slate-600 mt-1">
                {facility.contact_type_id}
              </p>
            </div>
          )}
          {facility.visit_notes && (
            <div>
              <p className="text-sm font-medium text-slate-700">
                訪問時の準備
              </p>
              <p className="text-sm text-slate-600 mt-1 whitespace-pre-line">
                {facility.visit_notes}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Facility photos */}
      <Card title="施設写真">
        <div className="h-64 w-full rounded-lg border border-slate-200 bg-slate-100 flex items-center justify-center">
          <div className="text-center text-slate-400">
            <ClipboardDocumentIcon className="h-12 w-12 mx-auto mb-2" />
            <p className="text-sm">写真がありません</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

