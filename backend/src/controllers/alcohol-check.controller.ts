import { Request, Response } from "express";
import * as AlcoholCheckService from "../services/alcohol-check.service";

export const getAllAlcoholChecks = async (_req: Request, res: Response) => {
  try {
    const checks = await AlcoholCheckService.getAllAlcoholChecks();
    res.json(checks);
  } catch (error: any) {
    const status = error.status || 500;
    res.status(status).json({
      message: error.message || "アルコールチェックの取得に失敗しました",
    });
  }
};

export const getAlcoholCheckById = async (req: Request, res: Response) => {
  try {
    const check = await AlcoholCheckService.getAlcoholCheckById(
      Number(req.params.id)
    );
    if (!check) {
      return res.status(404).json({ message: "アルコールチェックが見つかりません" });
    }
    res.json(check);
  } catch (error: any) {
    const status = error.status || 500;
    res.status(status).json({
      message: error.message || "アルコールチェックの取得に失敗しました",
    });
  }
};

export const getMyAlcoholChecks = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.sub ? Number(req.user.sub) : undefined;
    if (!userId) {
      return res.status(401).json({ message: "認証が必要です" });
    }
    const checks = await AlcoholCheckService.getAlcoholChecksByUser(userId);
    res.json(checks);
  } catch (error: any) {
    const status = error.status || 500;
    res.status(status).json({
      message: error.message || "アルコールチェックの取得に失敗しました",
    });
  }
};

export const createAlcoholCheck = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.sub ? Number(req.user.sub) : undefined;
    const check = await AlcoholCheckService.createAlcoholCheck({
      ...req.body,
      checked_by: userId,
    });
    res.status(201).json(check);
  } catch (error: any) {
    const status = error.status || 500;
    res.status(status).json({
      message: error.message || "アルコールチェックの作成に失敗しました",
    });
  }
};

export const updateAlcoholCheck = async (req: Request, res: Response) => {
  try {
    const check = await AlcoholCheckService.updateAlcoholCheck(
      Number(req.params.id),
      req.body
    );
    res.json(check);
  } catch (error: any) {
    const status = error.status || 500;
    res.status(status).json({
      message: error.message || "アルコールチェックの更新に失敗しました",
    });
  }
};

export const deleteAlcoholCheck = async (req: Request, res: Response) => {
  try {
    await AlcoholCheckService.deleteAlcoholCheck(Number(req.params.id));
    res.json({ message: "アルコールチェックを削除しました" });
  } catch (error: any) {
    const status = error.status || 500;
    res.status(status).json({
      message: error.message || "アルコールチェックの削除に失敗しました",
    });
  }
};

