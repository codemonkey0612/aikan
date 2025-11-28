import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useCarePlansByResident } from "../hooks/useCarePlans";
import { useCarePlanItems, useUpdateCarePlanItem } from "../hooks/useCarePlans";
import { useDiagnosesByResident, useDeleteDiagnosis } from "../hooks/useDiagnoses";
import { useMedicationNotesByResident, useActiveMedicationNotesByResident, useDeleteMedicationNote } from "../hooks/useMedicationNotes";
import { useVitalAlertsByResident, useVitalAlertTriggers, useAcknowledgeVitalAlertTrigger } from "../hooks/useVitalAlerts";
import { Card } from "../components/ui/Card";
import { Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow } from "../components/ui/Table";
import { ExclamationTriangleIcon, PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import type { CarePlan, VitalAlert } from "../api/types";
import { FileUpload } from "../components/files/FileUpload";
import { FileList } from "../components/files/FileList";

export function CarePlanPage() {
  const { id } = useParams<{ id: string }>();
  const residentId = id ? Number(id) : 0;

  const [activeTab, setActiveTab] = useState<"care-plans" | "diagnoses" | "medications" | "alerts">("care-plans");
  const [selectedCarePlan, setSelectedCarePlan] = useState<number | null>(null);

  const { data: carePlans } = useCarePlansByResident(residentId);
  const { data: diagnoses } = useDiagnosesByResident(residentId);
  const { data: medications } = useMedicationNotesByResident(residentId);
  const { data: activeMedications } = useActiveMedicationNotesByResident(residentId);
  const { data: vitalAlerts } = useVitalAlertsByResident(residentId);
  const { data: alertTriggers } = useVitalAlertTriggers({ resident_id: residentId, acknowledged: false });

  const { data: carePlanItems } = useCarePlanItems(selectedCarePlan || 0);

  const updateCarePlanItemMutation = useUpdateCarePlanItem();
  const deleteDiagnosisMutation = useDeleteDiagnosis();
  const deleteMedicationMutation = useDeleteMedicationNote();
  const acknowledgeTriggerMutation = useAcknowledgeVitalAlertTrigger();

  const getPriorityColor = (priority: CarePlan["priority"]) => {
    switch (priority) {
      case "URGENT":
        return "bg-rose-100 text-rose-700";
      case "HIGH":
        return "bg-orange-100 text-orange-700";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const getSeverityColor = (severity: VitalAlert["severity"]) => {
    switch (severity) {
      case "CRITICAL":
        return "bg-rose-100 text-rose-700";
      case "HIGH":
        return "bg-orange-100 text-orange-700";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-blue-100 text-blue-700";
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-slate-500">
            ケアプラン管理
          </p>
          <h1 className="text-3xl font-semibold text-slate-900">
            入居者ケアプラン
          </h1>
        </div>
        <Link
          to="/residents"
          className="text-sm text-brand-600 hover:text-brand-500"
        >
          ← 入居者一覧に戻る
        </Link>
      </header>

      {/* アラート通知 */}
      {alertTriggers && alertTriggers.length > 0 && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4">
          <div className="flex items-center gap-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-rose-600" />
            <h3 className="font-semibold text-rose-900">
              バイタルアラート ({alertTriggers.length}件)
            </h3>
          </div>
          <div className="mt-2 space-y-2">
            {alertTriggers.slice(0, 5).map((trigger) => (
              <div
                key={trigger.id}
                className="flex items-center justify-between rounded bg-white p-2"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {trigger.alert_type}: {trigger.measured_value}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(trigger.triggered_at).toLocaleString("ja-JP")}
                  </p>
                </div>
                <button
                  onClick={() =>
                    acknowledgeTriggerMutation.mutate({ id: trigger.id })
                  }
                  className="rounded bg-rose-600 px-3 py-1 text-xs text-white hover:bg-rose-500"
                >
                  確認
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* タブ */}
      <div className="flex gap-2 border-b border-slate-200">
        {[
          { id: "care-plans", label: "ケアプラン" },
          { id: "diagnoses", label: "診断" },
          { id: "medications", label: "薬剤" },
          { id: "alerts", label: "バイタルアラート" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 text-sm font-medium transition ${
              activeTab === tab.id
                ? "border-b-2 border-brand-600 text-brand-600"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ケアプランタブ */}
      {activeTab === "care-plans" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card
            title="ケアプラン一覧"
            actions={
              <button
                className="flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-500"
              >
                <PlusIcon className="h-4 w-4" />
                新規作成
              </button>
            }
          >
            <div className="space-y-2">
              {carePlans?.map((plan) => (
                <div
                  key={plan.id}
                  className={`cursor-pointer rounded-lg border p-3 transition ${
                    selectedCarePlan === plan.id
                      ? "border-brand-300 bg-brand-50"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                  onClick={() => setSelectedCarePlan(plan.id)}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-slate-900">{plan.title}</h4>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${getPriorityColor(
                        plan.priority
                      )}`}
                    >
                      {plan.priority}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">
                    {plan.start_date} - {plan.end_date || "継続"}
                  </p>
                  <span
                    className={`mt-2 inline-block rounded-full px-2 py-1 text-xs ${
                      plan.status === "ACTIVE"
                        ? "bg-green-100 text-green-700"
                        : plan.status === "COMPLETED"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {plan.status === "ACTIVE"
                      ? "進行中"
                      : plan.status === "COMPLETED"
                      ? "完了"
                      : "キャンセル"}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {selectedCarePlan && (
            <Card
              title="ケアプラン項目"
            actions={
              <button
                className="text-sm font-semibold text-brand-600 hover:text-brand-500"
              >
                <PlusIcon className="h-4 w-4" />
              </button>
            }
            >
              <div className="space-y-2">
                {carePlanItems?.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border border-slate-200 p-3"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={item.completed}
                          onChange={(e) =>
                            updateCarePlanItemMutation.mutate({
                              id: item.id,
                              data: { completed: e.target.checked },
                            })
                          }
                          className="h-4 w-4"
                        />
                        <p
                          className={`text-sm ${
                            item.completed
                              ? "text-slate-400 line-through"
                              : "text-slate-900"
                          }`}
                        >
                          {item.task_description}
                        </p>
                      </div>
                      {item.frequency && (
                        <p className="mt-1 text-xs text-slate-500">
                          頻度: {item.frequency}
                        </p>
                      )}
                      {item.due_date && (
                        <p className="mt-1 text-xs text-slate-500">
                          期限: {item.due_date}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* 診断タブ */}
      {activeTab === "diagnoses" && (
        <Card
          title="診断一覧"
          actions={
            <button
              className="flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-500"
            >
              <PlusIcon className="h-4 w-4" />
              新規作成
            </button>
          }
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeaderCell>診断名</TableHeaderCell>
                <TableHeaderCell>診断日</TableHeaderCell>
                <TableHeaderCell>重症度</TableHeaderCell>
                <TableHeaderCell>ステータス</TableHeaderCell>
                <TableHeaderCell>操作</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {diagnoses?.map((diagnosis) => (
                <TableRow key={diagnosis.id}>
                  <TableCell className="font-medium">
                    {diagnosis.diagnosis_name}
                  </TableCell>
                  <TableCell>{diagnosis.diagnosis_date || "--"}</TableCell>
                  <TableCell>{diagnosis.severity || "--"}</TableCell>
                  <TableCell>{diagnosis.status}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <button className="text-brand-600 hover:text-brand-500">
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() =>
                          deleteDiagnosisMutation.mutate(diagnosis.id)
                        }
                        className="text-rose-600 hover:text-rose-500"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* 薬剤タブ */}
      {activeTab === "medications" && (
        <div className="space-y-6">
          <Card
            title="薬剤一覧"
            actions={
              <button
                className="flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-500"
              >
                <PlusIcon className="h-4 w-4" />
                新規作成
              </button>
            }
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHeaderCell>薬剤名</TableHeaderCell>
                  <TableHeaderCell>用量</TableHeaderCell>
                  <TableHeaderCell>頻度</TableHeaderCell>
                  <TableHeaderCell>開始日</TableHeaderCell>
                  <TableHeaderCell>ステータス</TableHeaderCell>
                  <TableHeaderCell>操作</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {medications?.map((medication) => (
                  <TableRow key={medication.id}>
                    <TableCell className="font-medium">
                      {medication.medication_name}
                    </TableCell>
                    <TableCell>{medication.dosage || "--"}</TableCell>
                    <TableCell>{medication.frequency || "--"}</TableCell>
                    <TableCell>{medication.start_date || "--"}</TableCell>
                    <TableCell>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          medication.status === "ACTIVE"
                            ? "bg-green-100 text-green-700"
                            : medication.status === "DISCONTINUED"
                            ? "bg-rose-100 text-rose-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {medication.status === "ACTIVE"
                          ? "使用中"
                          : medication.status === "DISCONTINUED"
                          ? "中止"
                          : "完了"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <button className="text-brand-600 hover:text-brand-500">
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() =>
                            deleteMedicationMutation.mutate(medication.id)
                          }
                          className="text-rose-600 hover:text-rose-500"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          {activeMedications && activeMedications.length > 0 && (
            <Card title="現在使用中の薬剤">
              <div className="space-y-2">
                {activeMedications.map((medication) => (
                  <div
                    key={medication.id}
                    className="rounded-lg border border-green-200 bg-green-50 p-3"
                  >
                    <p className="font-semibold text-slate-900">
                      {medication.medication_name}
                    </p>
                    <p className="text-sm text-slate-600">
                      {medication.dosage} - {medication.frequency}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* ケアノート添付ファイル */}
          <Card title="ケアノート添付ファイル">
            <div className="space-y-4">
              <FileUpload
                category="CARE_NOTE_ATTACHMENT"
                entity_type="resident"
                entity_id={residentId}
                accept=".pdf,.doc,.docx,image/*"
              />
              <FileList
                category="CARE_NOTE_ATTACHMENT"
                entity_type="resident"
                entity_id={residentId}
              />
            </div>
          </Card>
        </div>
      )}

      {/* バイタルアラートタブ */}
      {activeTab === "alerts" && (
        <div className="space-y-6">
          <Card
            title="バイタルアラート設定"
            actions={
              <button
                className="flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-500"
              >
                <PlusIcon className="h-4 w-4" />
                新規作成
              </button>
            }
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHeaderCell>タイプ</TableHeaderCell>
                  <TableHeaderCell>最小値</TableHeaderCell>
                  <TableHeaderCell>最大値</TableHeaderCell>
                  <TableHeaderCell>重要度</TableHeaderCell>
                  <TableHeaderCell>ステータス</TableHeaderCell>
                  <TableHeaderCell>操作</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vitalAlerts?.map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell className="font-medium">
                      {alert.alert_type === "SYSTOLIC_BP"
                        ? "収縮期血圧"
                        : alert.alert_type === "DIASTOLIC_BP"
                        ? "拡張期血圧"
                        : alert.alert_type === "PULSE"
                        ? "脈拍"
                        : alert.alert_type === "TEMPERATURE"
                        ? "体温"
                        : "SpO2"}
                    </TableCell>
                    <TableCell>{alert.min_value ?? "--"}</TableCell>
                    <TableCell>{alert.max_value ?? "--"}</TableCell>
                    <TableCell>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${getSeverityColor(
                          alert.severity
                        )}`}
                      >
                        {alert.severity}
                      </span>
                    </TableCell>
                    <TableCell>
                      {alert.active ? (
                        <span className="text-green-600">有効</span>
                      ) : (
                        <span className="text-slate-400">無効</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <button className="text-brand-600 hover:text-brand-500">
                        <PencilIcon className="h-4 w-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          {alertTriggers && alertTriggers.length > 0 && (
            <Card title="アラート履歴">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHeaderCell>タイプ</TableHeaderCell>
                    <TableHeaderCell>測定値</TableHeaderCell>
                    <TableHeaderCell>発生日時</TableHeaderCell>
                    <TableHeaderCell>ステータス</TableHeaderCell>
                    <TableHeaderCell>操作</TableHeaderCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {alertTriggers.map((trigger) => (
                    <TableRow key={trigger.id}>
                      <TableCell className="font-medium">
                        {trigger.alert_type}
                      </TableCell>
                      <TableCell className="font-semibold text-rose-600">
                        {trigger.measured_value}
                      </TableCell>
                      <TableCell>
                        {new Date(trigger.triggered_at).toLocaleString("ja-JP")}
                      </TableCell>
                      <TableCell>
                        {trigger.acknowledged ? (
                          <span className="text-green-600">確認済み</span>
                        ) : (
                          <span className="text-rose-600">未確認</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {!trigger.acknowledged && (
                          <button
                            onClick={() =>
                              acknowledgeTriggerMutation.mutate({
                                id: trigger.id,
                              })
                            }
                            className="rounded bg-rose-600 px-3 py-1 text-xs text-white hover:bg-rose-500"
                          >
                            確認
                          </button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

