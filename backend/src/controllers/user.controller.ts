import { Request, Response } from "express";
import * as UserService from "../services/user.service";
import { calculatePagination } from "../validations/pagination.validation";

export const getAllUsers = async (req: Request, res: Response) => {
  // Check if pagination parameters are provided
  const hasPagination = req.query.page || req.query.limit;
  
  if (hasPagination) {
    // Paginated response
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 20;
    const sortBy = (req.query.sortBy as string) || "created_at";
    const sortOrder = (req.query.sortOrder as "asc" | "desc") || "desc";
    
    const filters = {
      role: req.query.role as "admin" | "nurse" | "facility_manager" | "corporate_officer" | undefined,
      search: req.query.search as string | undefined,
    };
    
    const { data, total } = await UserService.getUsersPaginated(
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
  } else {
    // Non-paginated response (for backward compatibility)
    const users = await UserService.getAllUsers();
    res.json(users);
  }
};

export const getUserById = async (req: Request, res: Response) => {
  const user = await UserService.getUserById(Number(req.params.id));
  res.json(user);
};

export const createUser = async (req: Request, res: Response) => {
  try {
    // passwordフィールドをハッシュ化
    const { password, ...rest } = req.body;
    let hashedPassword: string | null = null;
    if (password) {
      const bcrypt = require("bcryptjs");
      hashedPassword = await bcrypt.hash(password, 10);
    }
    const created = await UserService.createUser({ ...rest, password: hashedPassword });
    res.json(created);
  } catch (error: any) {
    const status = error.status || 500;
    res.status(status).json({
      message: error.message || "ユーザーの作成に失敗しました",
    });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const updated = await UserService.updateUser(Number(req.params.id), req.body);
  res.json(updated);
};

export const deleteUser = async (req: Request, res: Response) => {
  await UserService.deleteUser(Number(req.params.id));
  res.json({ message: "Deleted" });
};
