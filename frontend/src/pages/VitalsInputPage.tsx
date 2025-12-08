import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useResidents } from "../hooks/useResidents";
import { useCreateVital } from "../hooks/useVitals";
import { Card } from "../components/ui/Card";
import { Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow } from "../components/ui/Table";

interface VitalFormState {
  resident_id: string | null;
  measured_at: string;
  systolic_bp: string;
  diastolic_bp: string;
  pulse: string;
  temperature: string;
  spo2: string;
  note: string;
}

export function VitalsInputPage() {
  const navigate = useNavigate();
  const { data: residents } = useResidents();
  const createVital = useCreateVital();

  const [form, setForm] = useState<VitalFormState>({
    resident_id: null,
    measured_at: new Date().toISOString().slice(0, 16),
    systolic_bp: "",
    diastolic_bp: "",
    pulse: "",
    temperature: "",
    spo2: "",
    note: "",
  });

  const handleChange = (field: keyof VitalFormState, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]:
        field === "resident_id" ? (value || null) : value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.resident_id) return;

    await createVital.mutateAsync({
      resident_id: form.resident_id,
      measured_at: new Date(form.measured_at).toISOString(),
      systolic_bp: form.systolic_bp ? Number(form.systolic_bp) : null,
      diastolic_bp: form.diastolic_bp ? Number(form.diastolic_bp) : null,
      pulse: form.pulse ? Number(form.pulse) : null,
      temperature: form.temperature ? Number(form.temperature) : null,
      spo2: form.spo2 ? Number(form.spo2) : null,
      note: form.note || null,
    });

    navigate("/vitals");
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm uppercase tracking-wide text-slate-500">
          バイタル記録
        </p>
        <h1 className="text-3xl font-semibold text-slate-900">
          バイタル入力フォーム
        </h1>
        <p className="text-slate-500">
          測定値を入力して保存すると、一覧に反映されます。
        </p>
      </header>

      <Card>
        <form className="grid gap-6" onSubmit={handleSubmit}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeaderCell>項目</TableHeaderCell>
                <TableHeaderCell>入力</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>入居者</TableCell>
                <TableCell>
                  <select
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    value={form.resident_id ?? ""}
                    onChange={(e) =>
                      handleChange("resident_id", e.target.value)
                    }
                    required
                  >
                    <option value="">選択してください</option>
                    {residents?.map((resident) => (
                      <option key={resident.id ?? resident.resident_id} value={resident.id ?? resident.resident_id}>
                        #{resident.id ?? resident.resident_id} {resident.first_name} {resident.last_name}
                      </option>
                    ))}
                  </select>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>測定日時</TableCell>
                <TableCell>
                  <input
                    type="datetime-local"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    value={form.measured_at}
                    onChange={(e) =>
                      handleChange("measured_at", e.target.value)
                    }
                    required
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>血圧 (mmHg)</TableCell>
                <TableCell className="flex gap-3">
                  <input
                    type="number"
                    placeholder="収縮期"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    value={form.systolic_bp}
                    onChange={(e) =>
                      handleChange("systolic_bp", e.target.value)
                    }
                  />
                  <input
                    type="number"
                    placeholder="拡張期"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    value={form.diastolic_bp}
                    onChange={(e) =>
                      handleChange("diastolic_bp", e.target.value)
                    }
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>脈拍 (bpm)</TableCell>
                <TableCell>
                  <input
                    type="number"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    value={form.pulse}
                    onChange={(e) => handleChange("pulse", e.target.value)}
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>体温 (℃)</TableCell>
                <TableCell>
                  <input
                    type="number"
                    step="0.1"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    value={form.temperature}
                    onChange={(e) =>
                      handleChange("temperature", e.target.value)
                    }
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>SpO₂ (%)</TableCell>
                <TableCell>
                  <input
                    type="number"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    value={form.spo2}
                    onChange={(e) => handleChange("spo2", e.target.value)}
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>備考</TableCell>
                <TableCell>
                  <textarea
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    rows={3}
                    value={form.note}
                    onChange={(e) => handleChange("note", e.target.value)}
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate("/vitals")}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-500"
            >
              保存する
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}

