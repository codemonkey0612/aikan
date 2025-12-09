import { Request, Response } from "express";
import * as NotificationService from "../services/notification.service";

export const getAllNotifications = async (req: Request, res: Response) => {
  const notifications = await NotificationService.getAllNotifications();
  res.json(notifications);
};

export const getNotificationById = async (req: Request, res: Response) => {
  const notification = await NotificationService.getNotificationById(
    Number(req.params.id)
  );
  res.json(notification);
};

export const createNotification = async (req: Request, res: Response) => {
  // Anyone can create, set created_by from authenticated user
  const userId = req.user?.id;
  const notificationData = {
    ...req.body,
    created_by: userId,
  };
  const created = await NotificationService.createNotification(notificationData);
  res.status(201).json(created);
};

export const updateNotification = async (req: Request, res: Response) => {
  const notificationId = Number(req.params.id);
  const userId = req.user?.id;
  const userRole = req.user?.role;

  // Check if notification exists and user owns it (or is admin)
  const notification = await NotificationService.getNotificationById(notificationId);
  if (!notification) {
    return res.status(404).json({ message: "通知が見つかりません" });
  }

  // Only allow update if user is the creator or admin
  if (notification.created_by !== userId && userRole !== "admin") {
    return res.status(403).json({ message: "この通知を更新する権限がありません" });
  }

  const updated = await NotificationService.updateNotification(
    notificationId,
    req.body
  );
  res.json(updated);
};

export const deleteNotification = async (req: Request, res: Response) => {
  const notificationId = Number(req.params.id);
  const userId = req.user?.id;
  const userRole = req.user?.role;

  // Check if notification exists
  const notification = await NotificationService.getNotificationById(notificationId);
  if (!notification) {
    return res.status(404).json({ message: "通知が見つかりません" });
  }

  // Only allow delete if user is the creator or admin
  if (notification.created_by !== userId && userRole !== "admin") {
    return res.status(403).json({ message: "この通知を削除する権限がありません" });
  }

  await NotificationService.deleteNotification(notificationId);
  res.json({ message: "Deleted" });
};

