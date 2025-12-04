import { Request, Response } from "express";
import * as AuthService from "../services/auth.service";

export const register = async (req: Request, res: Response) => {
  try {
    const { first_name, last_name, email, phone_number, role, password } = req.body;

    const result = await AuthService.register({
      first_name,
      last_name,
      email,
      phone_number,
      role: role || "nurse",
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

export const refresh = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    const result = await AuthService.refreshAccessToken(refreshToken);
    res.json(result);
  } catch (error: any) {
    const status = error.status || 500;
    res.status(status).json({
      message: error.message || "トークンのリフレッシュに失敗しました",
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await AuthService.revokeRefreshToken(refreshToken);
    }

    res.json({ message: "ログアウトしました" });
  } catch (error: any) {
    const status = error.status || 500;
    res.status(status).json({
      message: error.message || "ログアウトに失敗しました",
    });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.sub ? Number(req.user.sub) : undefined;
    if (!userId) {
      return res.status(401).json({ message: "認証が必要です" });
    }

    const updated = await AuthService.updateProfile(userId, req.body);
    res.json(updated);
  } catch (error: any) {
    const status = error.status || 500;
    res.status(status).json({
      message: error.message || "プロフィールの更新に失敗しました",
    });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.sub ? Number(req.user.sub) : undefined;
    if (!userId) {
      return res.status(401).json({ message: "認証が必要です" });
    }

    const { current_password, new_password } = req.body;
    const result = await AuthService.changePassword(
      userId,
      current_password,
      new_password
    );
    res.json(result);
  } catch (error: any) {
    const status = error.status || 500;
    res.status(status).json({
      message: error.message || "パスワードの変更に失敗しました",
    });
  }
};

