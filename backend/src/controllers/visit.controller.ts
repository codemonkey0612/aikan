import { Request, Response } from "express";
import * as VisitService from "../services/visit.service";
import { calculatePagination } from "../validations/pagination.validation";

export const getAllVisits = async (req: Request, res: Response) => {
  // バリデーション済みクエリパラメータを使用（なければ元のqueryから取得）
  const validated = req.validatedQuery || req.query;
  
  // クエリパラメータからページネーション情報を取得
  const page = validated.page ? Number(validated.page) : 1;
  const limit = validated.limit ? Number(validated.limit) : 20;
  const sortBy = (validated.sortBy as string) || "visited_at";
  const sortOrder = (validated.sortOrder as "asc" | "desc") || "desc";

  // フィルター
  const filters = {
    shift_id: req.query.shift_id ? Number(req.query.shift_id) : undefined,
    resident_id: req.query.resident_id as string | undefined, // VARCHAR(50)
    visited_from: req.query.visited_from as string | undefined,
    visited_to: req.query.visited_to as string | undefined,
  };

  const { data, total } = await VisitService.getVisitsPaginated(
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

export const getVisitById = async (req: Request, res: Response) => {
  const visit = await VisitService.getVisitById(Number(req.params.id));
  res.json(visit);
};

export const createVisit = async (req: Request, res: Response) => {
  const created = await VisitService.createVisit(req.body);
  res.status(201).json(created);
};

export const updateVisit = async (req: Request, res: Response) => {
  const updated = await VisitService.updateVisit(
    Number(req.params.id),
    req.body
  );
  res.json(updated);
};

export const deleteVisit = async (req: Request, res: Response) => {
  await VisitService.deleteVisit(Number(req.params.id));
  res.json({ message: "Deleted" });
};

