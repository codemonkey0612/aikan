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
      <Card title="Facility information">
        <div className="space-y-4">
          {corporation && (
            <div>
              <p className="text-sm font-medium text-slate-700">Company name</p>
              <p className="text-sm text-slate-600 mt-1">{corporation.name}</p>
            </div>
          )}
          {facility.pl_support_id && (
            <div>
              <p className="text-sm font-medium text-slate-700">PL compliant</p>
              <p className="text-sm text-slate-600 mt-1">
                {facility.pl_support_id === "completed" ? "PL completed" : facility.pl_support_id}
              </p>
            </div>
          )}
          {facility.building_type_id && (
            <div>
              <p className="text-sm font-medium text-slate-700">Building Type</p>
              <p className="text-sm text-slate-600 mt-1">
                {facility.building_type_id}
              </p>
            </div>
          )}
          {facility.postal_code && (
            <div>
              <p className="text-sm font-medium text-slate-700">Post code</p>
              <p className="text-sm text-slate-600 mt-1">
                {facility.postal_code}
              </p>
            </div>
          )}
          {facility.address_prefecture && (
            <div>
              <p className="text-sm font-medium text-slate-700">
                Address 1 (Prefecture)
              </p>
              <p className="text-sm text-slate-600 mt-1">
                {facility.address_prefecture}
              </p>
            </div>
          )}
          {address && (
            <div>
              <p className="text-sm font-medium text-slate-700">
                Address 2 (city, ward, town, village, number)
              </p>
              <p className="text-sm text-slate-600 mt-1">{address}</p>
              <button
                onClick={copyAddressToClipboard}
                className="mt-2 text-sm text-brand-600 hover:text-brand-700"
              >
                Copy address to clipboard
              </button>
            </div>
          )}
          {facility.phone_number && (
            <div>
              <p className="text-sm font-medium text-slate-700">
                Advance contact phone number
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
                Emergency Phone Number
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
        <Card title="Map">
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
                Coordinate correction
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Billing Information */}
      <Card title="Billing Information">
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-slate-700">Capacity</p>
            <p className="text-sm text-slate-600 mt-1">-</p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700">Number of users</p>
            <p className="text-sm text-slate-600 mt-1">-</p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700">Request method</p>
            <p className="text-sm text-slate-600 mt-1">
              {corporation ? "For each corporation" : "-"}
            </p>
          </div>
        </div>
      </Card>

      {/* Access Intelligence */}
      <Card title="Access Intelligence">
        <div className="space-y-4">
          {facility.pre_visit_contact_id && (
            <div>
              <p className="text-sm font-medium text-slate-700">
                Contact before the visit
              </p>
              <p className="text-sm text-slate-600 mt-1">
                {facility.pre_visit_contact_id}
              </p>
            </div>
          )}
          {facility.contact_type_id && (
            <div>
              <p className="text-sm font-medium text-slate-700">Contact Type</p>
              <p className="text-sm text-slate-600 mt-1">
                {facility.contact_type_id}
              </p>
            </div>
          )}
          {facility.visit_notes && (
            <div>
              <p className="text-sm font-medium text-slate-700">
                Preparation for the visit
              </p>
              <p className="text-sm text-slate-600 mt-1 whitespace-pre-line">
                {facility.visit_notes}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Facility photos */}
      <Card title="Facility photos">
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

