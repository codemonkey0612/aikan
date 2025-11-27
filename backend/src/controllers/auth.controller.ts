import { Request, Response } from "express";
import * as AuthService from "../services/auth.service";

export const register = async (req: Request, res: Response) => {
  try {
    const { first_name, last_name, email, phone, role, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "メールアドレスとパスワードは必須です",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "パスワードは6文字以上である必要があります",
      });
    }

    const result = await AuthService.register({
      first_name,
      last_name,
      email,
      phone,
      role: role || "ADMIN",
      password,
    });

    res.status(201).json(result);
  } catch (error: any) {
    const status = error.status || 500;
    res.status(status).json({
      message: error.message || "登録に失敗しました",
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "メールアドレスとパスワードは必須です",
      });
    }

    const result = await AuthService.login(email, password);
    res.json(result);
  } catch (error: any) {
    const status = error.status || 500;
    res.status(status).json({
      message: error.message || "ログインに失敗しました",
    });
  }
};

export const me = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.sub ? Number(req.user.sub) : undefined;
    if (!userId) {
      return res.status(401).json({ message: "認証が必要です" });
    }

    const profile = await AuthService.getProfile(userId);
    if (!profile) {
      return res.status(404).json({ message: "ユーザーが見つかりません" });
    }

    res.json(profile);
  } catch (error: any) {
    const status = error.status || 500;
    res.status(status).json({
      message: error.message || "プロフィールの取得に失敗しました",
    });
  }
};

