import { Request, Response } from "express";
import * as ShiftService from "../services/shift.service";
import { calculatePagination } from "../validations/pagination.validation";

export const getAllShifts = async (req: Request, res: Response) => {
  // クエリパラメータからページネーション情報を取得
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const sortBy = (req.query.sortBy as string) || "created_at";
  const sortOrder = (req.query.sortOrder as "asc" | "desc") || "desc";

  // フィルター
  const filters = {
    user_id: req.query.user_id ? Number(req.query.user_id) : undefined,
    facility_id: req.query.facility_id ? Number(req.query.facility_id) : undefined,
    date_from: req.query.date_from as string | undefined,
    date_to: req.query.date_to as string | undefined,
  };

  const { data, total } = await ShiftService.getShiftsPaginated(
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

export const getShiftById = async (req: Request, res: Response) => {
  const shift = await ShiftService.getShiftById(Number(req.params.id));
  res.json(shift);
};

export const createShift = async (req: Request, res: Response) => {
  const created = await ShiftService.createShift(req.body);
  res.status(201).json(created);
};

export const updateShift = async (req: Request, res: Response) => {
  const updated = await ShiftService.updateShift(
    Number(req.params.id),
    req.body
  );
  res.json(updated);
};

export const deleteShift = async (req: Request, res: Response) => {
  await ShiftService.deleteShift(Number(req.params.id));
  res.json({ message: "Deleted" });
};

