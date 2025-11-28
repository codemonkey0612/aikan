import { Request, Response } from "express";
import * as UserService from "../services/user.service";

export const getAllUsers = async (req: Request, res: Response) => {
  const users = await UserService.getAllUsers();
  res.json(users);
};

export const getUserById = async (req: Request, res: Response) => {
  const user = await UserService.getUserById(Number(req.params.id));
  res.json(user);
};

export const createUser = async (req: Request, res: Response) => {
  try {
    // passwordフィールドをpassword_hashに変換
    const { password, ...rest } = req.body;
    let password_hash: string | null = null;
    if (password) {
      const bcrypt = require("bcryptjs");
      password_hash = await bcrypt.hash(password, 10);
    }
    const created = await UserService.createUser({ ...rest, password_hash });
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
