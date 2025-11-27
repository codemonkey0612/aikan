import { Request, Response } from "express";
import * as AuthService from "../services/auth.service";

export const register = async (req: Request, res: Response) => {
  const { first_name, last_name, email, phone, role, password } = req.body;

  const result = await AuthService.register({
    first_name,
    last_name,
    email,
    phone,
    role,
    password,
  });

  res.status(201).json(result);
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await AuthService.login(email, password);
  res.json(result);
};

export const me = async (req: Request, res: Response) => {
  const userId = req.user?.sub ? Number(req.user.sub) : undefined;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const profile = await AuthService.getProfile(userId);
  res.json(profile);
};

