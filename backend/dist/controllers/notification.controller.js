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
    const created = await NotificationService.createNotification(req.body);
    res.status(201).json(created);
};
exports.createNotification = createNotification;
const updateNotification = async (req, res) => {
    const updated = await NotificationService.updateNotification(Number(req.params.id), req.body);
    res.json(updated);
};
exports.updateNotification = updateNotification;
const deleteNotification = async (req, res) => {
    await NotificationService.deleteNotification(Number(req.params.id));
    res.json({ message: "Deleted" });
};
exports.deleteNotification = deleteNotification;
