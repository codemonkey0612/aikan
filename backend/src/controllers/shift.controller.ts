import { Request, Response } from "express";
import * as ShiftService from "../services/shift.service";
import { calculatePagination } from "../validations/pagination.validation";

export const getAllShifts = async (req: Request, res: Response) => {
  // バリデーション済みクエリパラメータを使用（なければ元のqueryから取得）
  const validated = req.validatedQuery || req.query;
  
  // クエリパラメータからページネーション情報を取得
  const page = validated.page ? Number(validated.page) : 1;
  const limit = validated.limit ? Number(validated.limit) : 20;
  const sortBy = (validated.sortBy as string) || "created_at";
  const sortOrder = (validated.sortOrder as "asc" | "desc") || "desc";

  // フィルター
  const filters = {
    nurse_id: req.query.nurse_id as string | undefined, // VARCHAR(100)
    facility_id: req.query.facility_id as string | undefined, // VARCHAR(50)
    shift_period: req.query.shift_period as string | undefined,
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

