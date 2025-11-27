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
  const created = await NotificationService.createNotification(req.body);
  res.status(201).json(created);
};

export const updateNotification = async (req: Request, res: Response) => {
  const updated = await NotificationService.updateNotification(
    Number(req.params.id),
    req.body
  );
  res.json(updated);
};

export const deleteNotification = async (req: Request, res: Response) => {
  await NotificationService.deleteNotification(Number(req.params.id));
  res.json({ message: "Deleted" });
};

