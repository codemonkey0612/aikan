import { Request, Response } from "express";
import * as VitalService from "../services/vital.service";
import { calculatePagination } from "../validations/pagination.validation";

export const getAllVitals = async (req: Request, res: Response) => {
  // クエリパラメータからページネーション情報を取得
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const sortBy = (req.query.sortBy as string) || "created_at";
  const sortOrder = (req.query.sortOrder as "asc" | "desc") || "desc";

  // フィルター
  const filters = {
    resident_id: req.query.resident_id ? Number(req.query.resident_id) : undefined,
    measured_from: req.query.measured_from as string | undefined,
    measured_to: req.query.measured_to as string | undefined,
    created_by: req.query.created_by ? Number(req.query.created_by) : undefined,
  };

  const { data, total } = await VitalService.getVitalsPaginated(
    page,
    limit,
    sortBy,
    sortOrder,
    filters
  );

  const pagination = calculatePagination(page, limit, total);

  res.json({
    data,
    pagination,
  });
};

export const getVitalById = async (req: Request, res: Response) => {
  const vital = await VitalService.getVitalById(Number(req.params.id));
  res.json(vital);
};

export const createVital = async (req: Request, res: Response) => {
  const created = await VitalService.createVital(req.body);
  res.status(201).json(created);
};

export const updateVital = async (req: Request, res: Response) => {
  const updated = await VitalService.updateVital(
    Number(req.params.id),
    req.body
  );
  res.json(updated);
};

export const deleteVital = async (req: Request, res: Response) => {
  await VitalService.deleteVital(Number(req.params.id));
  res.json({ message: "Deleted" });
};

