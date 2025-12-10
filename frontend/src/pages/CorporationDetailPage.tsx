import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getCorporationById } from "../api/corporations";
import { useAuth } from "../hooks/useAuth";
import { getDefaultAvatar } from "../utils/defaultAvatars";
import { Card } from "../components/ui/Card";
import { GoogleMapComponent } from "../components/maps/GoogleMap";
import {
  ArrowLeftIcon,
  BriefcaseIcon,
  MapPinIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  PencilIcon,
  PaperAirplaneIcon,
  EllipsisVerticalIcon,
} from "@heroicons/react/24/outline";
import type { Corporation } from "../api/types";

interface Comment {
  id: number;
  user_id: number;
  user_name: string;
  user_avatar?: string;
  content: string;
  created_at: string;
}

export function CorporationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [commentText, setCommentText] = useState("");

  const { data: corporation, isLoading } = useQuery({
    queryKey: ["corporation", id],
    queryFn: () => getCorporationById(id!).then((res) => res.data),
    enabled: !!id,
  });

  // Mock comments - in a real app, these would come from an API
  const [comments, setComments] = useState<Comment[]>([
    {
      id: 1,
      user_id: 1,
      user_name: "澤田 憲良",
      content: "上田さん 23日14時のアポ メルアド tatuya.u.2004.02@gmail.com",
      created_at: "2024-10-17T00:00:00Z",
    },
    {
      id: 2,
      user_id: 2,
      user_name: "小林萌絵",
      content: "社会福祉法人 あさひ会/5施設全て: シフト連絡は090-8738-5659 (サビ官: 上田様)までお願いします @お助け隊 茉美子さん",
      created_at: "2024-07-16T00:00:00Z",
    },
  ]);

  const handleSubmitComment = () => {
    if (!commentText.trim() || !user) return;

    const newComment: Comment = {
      id: comments.length + 1,
      user_id: user.id,
      user_name: `${user.last_name} ${user.first_name}`,
      content: commentText,
      created_at: new Date().toISOString(),
    };

    setComments([newComment, ...comments]);
    setCommentText("");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-500">読み込み中...</p>
      </div>
    );
  }

  if (!corporation) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-slate-500 mb-4">法人が見つかりませんでした。</p>
          <button
            onClick={() => navigate("/corporations")}
            className="text-brand-600 hover:text-brand-700"
          >
            一覧に戻る
          </button>
        </div>
      </div>
    );
  }

  const address = [
    corporation.address_prefecture,
    corporation.address_city,
    corporation.address_building,
  ]
    .filter(Boolean)
    .join(" ");

  const [lat, lng] = corporation.latitude_longitude
    ? corporation.latitude_longitude.split(",").map((s: string) => s.trim())
    : [null, null];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString("ja-JP", { month: "short", day: "numeric" });
    }
    return date.toLocaleDateString("ja-JP", { year: "numeric", month: "short", day: "numeric" });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <header>
        <button
          onClick={() => navigate("/corporations")}
          className="mb-4 inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          法人 / {corporation.name}
        </button>

        {/* Banner */}
        <div className="relative h-32 w-full rounded-lg mb-4 overflow-hidden">
          {corporation.photo_url ? (
            <img
              src={corporation.photo_url}
              alt={`${corporation.name} profit image`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-r from-blue-100 to-indigo-100 flex items-center justify-center">
            <p className="text-2xl font-handwriting text-slate-700">Thank you Nurses</p>
          </div>
          )}
        </div>

        {/* Profile Section */}
        <div className="flex items-start gap-4 -mt-16 relative z-10">
          <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-lg border-4 border-white">
            {corporation.photo_url ? (
              <img
                src={corporation.photo_url}
                alt={corporation.name}
                className="h-full w-full object-cover rounded-lg"
              />
            ) : (
              <BriefcaseIcon className="h-10 w-10" />
            )}
          </div>
          <div className="flex-1 pt-16">
            <h1 className="text-3xl font-semibold text-slate-900">
              {corporation.name}
            </h1>
            {corporation.name_kana && (
              <p className="text-lg text-slate-500 mt-1">
                {corporation.name_kana}
              </p>
            )}
          </div>
          <button className="mt-16 flex items-center gap-2 rounded-lg bg-pink-500 px-4 py-2 text-sm font-medium text-white hover:bg-pink-600">
            <PencilIcon className="h-4 w-4" />
            変更
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Corporate Information */}
          <Card title="法人情報">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-700">スケット法人ID</p>
                <p className="text-sm text-slate-600 mt-1">{corporation.corporation_id}</p>
              </div>
              {corporation.corporation_number && (
                <div>
                  <p className="text-sm font-medium text-slate-700">法人番号</p>
                  <p className="text-sm text-slate-600 mt-1">
                    {corporation.corporation_number}
                  </p>
                </div>
              )}
              {corporation.postal_code && (
                <div>
                  <p className="text-sm font-medium text-slate-700">郵便番号</p>
                  <p className="text-sm text-slate-600 mt-1">
                    〒{corporation.postal_code}
                  </p>
                </div>
              )}
              {address && (
                <div>
                  <p className="text-sm font-medium text-slate-700">住所</p>
                  <p className="text-sm text-slate-600 mt-1">
                    〒{corporation.postal_code || ""} {address}
                  </p>
                </div>
              )}
              {corporation.phone_number && (
                <div>
                  <p className="text-sm font-medium text-slate-700">電話番号1</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-slate-600">
                      {corporation.phone_number}
                    </span>
                    <button className="p-1.5 rounded-full bg-pink-100 text-pink-600 hover:bg-pink-200">
                      <PhoneIcon className="h-4 w-4" />
                    </button>
                    <button className="p-1.5 rounded-full bg-pink-100 text-pink-600 hover:bg-pink-200">
                      <ChatBubbleLeftRightIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Correspondence History Comments */}
          <Card title="対応履歴コメント">
            <div className="space-y-4">
              {/* Comment Input */}
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200">
                  {user && (
                    <img
                      src={getDefaultAvatar(user.role)}
                      alt={user.first_name}
                      className="h-full w-full rounded-full object-cover"
                    />
                  )}
                </div>
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleSubmitComment();
                    }
                  }}
                  placeholder="Write something..."
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                />
                <button
                  onClick={handleSubmitComment}
                  disabled={!commentText.trim()}
                  className="flex items-center gap-2 rounded-lg bg-pink-500 px-4 py-2 text-sm font-medium text-white hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <PaperAirplaneIcon className="h-4 w-4" />
                  送信
                </button>
              </div>

              {/* Comments List */}
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 flex-shrink-0">
                      <img
                        src={getDefaultAvatar("admin")}
                        alt={comment.user_name}
                        className="h-full w-full rounded-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-slate-900">
                          {comment.user_name}
                        </p>
                        <p className="text-xs text-slate-400">
                          {formatDate(comment.created_at)}
                        </p>
                      </div>
                      <p className="text-sm text-slate-700 whitespace-pre-wrap break-words">
                        {comment.content}
                      </p>
                    </div>
                    <button className="p-1 text-slate-400 hover:text-slate-600 flex-shrink-0">
                      <EllipsisVerticalIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Map */}
        <div>
          <Card title="Map">
            <div className="space-y-4">
              {lat && lng ? (
                <>
                  <div className="w-full rounded-lg border border-slate-200 overflow-hidden">
                    <GoogleMapComponent
                      lat={parseFloat(lat)}
                      lng={parseFloat(lng)}
                      height="384px"
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
                </>
              ) : (
                <div className="h-96 w-full rounded-lg border border-slate-200 bg-slate-100 flex items-center justify-center">
                  <div className="text-center text-slate-400">
                    <MapPinIcon className="h-12 w-12 mx-auto mb-2" />
                    <p className="text-sm">地図情報がありません</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

