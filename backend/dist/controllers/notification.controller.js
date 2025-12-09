"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteNotification = exports.updateNotification = exports.createNotification = exports.getNotificationById = exports.getAllNotifications = void 0;
const NotificationService = __importStar(require("../services/notification.service"));
const getAllNotifications = async (req, res) => {
    const notifications = await NotificationService.getAllNotifications();
    res.json(notifications);
};
exports.getAllNotifications = getAllNotifications;
const getNotificationById = async (req, res) => {
    const notification = await NotificationService.getNotificationById(Number(req.params.id));
    res.json(notification);
};
exports.getNotificationById = getNotificationById;
const createNotification = async (req, res) => {
    // Anyone can create, set created_by from authenticated user
    const userId = req.user?.id;
    const notificationData = {
        ...req.body,
        created_by: userId,
    };
    const created = await NotificationService.createNotification(notificationData);
    res.status(201).json(created);
};
exports.createNotification = createNotification;
const updateNotification = async (req, res) => {
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
    const updated = await NotificationService.updateNotification(notificationId, req.body);
    res.json(updated);
};
exports.updateNotification = updateNotification;
const deleteNotification = async (req, res) => {
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
exports.deleteNotification = deleteNotification;
