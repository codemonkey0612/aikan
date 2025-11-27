import * as NotificationModel from "../models/notification.model";

export const getAllNotifications = () => NotificationModel.getAllNotifications();
export const getNotificationById = (id: number) =>
  NotificationModel.getNotificationById(id);
export const createNotification = (data: NotificationModel.NotificationInput) =>
  NotificationModel.createNotification(data);
export const updateNotification = (
  id: number,
  data: Partial<NotificationModel.NotificationInput>
) => NotificationModel.updateNotification(id, data);
export const deleteNotification = (id: number) =>
  NotificationModel.deleteNotification(id);

