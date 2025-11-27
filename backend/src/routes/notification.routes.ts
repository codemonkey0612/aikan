import { Router } from "express";
import * as NotificationController from "../controllers/notification.controller";

const router = Router();

router.get("/", NotificationController.getAllNotifications);
router.get("/:id", NotificationController.getNotificationById);
router.post("/", NotificationController.createNotification);
router.put("/:id", NotificationController.updateNotification);
router.delete("/:id", NotificationController.deleteNotification);

export default router;

