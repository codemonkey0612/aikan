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
exports.deleteAlcoholCheck = exports.updateAlcoholCheck = exports.createAlcoholCheck = exports.getMyAlcoholChecks = exports.getAlcoholCheckById = exports.getAllAlcoholChecks = void 0;
const AlcoholCheckService = __importStar(require("../services/alcohol-check.service"));
const getAllAlcoholChecks = async (_req, res) => {
    try {
        const checks = await AlcoholCheckService.getAllAlcoholChecks();
        res.json(checks);
    }
    catch (error) {
        const status = error.status || 500;
        res.status(status).json({
            message: error.message || "アルコールチェックの取得に失敗しました",
        });
    }
};
exports.getAllAlcoholChecks = getAllAlcoholChecks;
const getAlcoholCheckById = async (req, res) => {
    try {
        const check = await AlcoholCheckService.getAlcoholCheckById(Number(req.params.id));
        if (!check) {
            return res.status(404).json({ message: "アルコールチェックが見つかりません" });
        }
        res.json(check);
    }
    catch (error) {
        const status = error.status || 500;
        res.status(status).json({
            message: error.message || "アルコールチェックの取得に失敗しました",
        });
    }
};
exports.getAlcoholCheckById = getAlcoholCheckById;
const getMyAlcoholChecks = async (req, res) => {
    try {
        const userId = req.user?.sub ? Number(req.user.sub) : undefined;
        if (!userId) {
            return res.status(401).json({ message: "認証が必要です" });
        }
        const checks = await AlcoholCheckService.getAlcoholChecksByUser(userId);
        res.json(checks);
    }
    catch (error) {
        const status = error.status || 500;
        res.status(status).json({
            message: error.message || "アルコールチェックの取得に失敗しました",
        });
    }
};
exports.getMyAlcoholChecks = getMyAlcoholChecks;
const createAlcoholCheck = async (req, res) => {
    try {
        const userId = req.user?.sub ? Number(req.user.sub) : undefined;
        const check = await AlcoholCheckService.createAlcoholCheck({
            ...req.body,
            checked_by: userId,
        });
        res.status(201).json(check);
    }
    catch (error) {
        const status = error.status || 500;
        res.status(status).json({
            message: error.message || "アルコールチェックの作成に失敗しました",
        });
    }
};
exports.createAlcoholCheck = createAlcoholCheck;
const updateAlcoholCheck = async (req, res) => {
    try {
        const check = await AlcoholCheckService.updateAlcoholCheck(Number(req.params.id), req.body);
        res.json(check);
    }
    catch (error) {
        const status = error.status || 500;
        res.status(status).json({
            message: error.message || "アルコールチェックの更新に失敗しました",
        });
    }
};
exports.updateAlcoholCheck = updateAlcoholCheck;
const deleteAlcoholCheck = async (req, res) => {
    try {
        await AlcoholCheckService.deleteAlcoholCheck(Number(req.params.id));
        res.json({ message: "アルコールチェックを削除しました" });
    }
    catch (error) {
        const status = error.status || 500;
        res.status(status).json({
            message: error.message || "アルコールチェックの削除に失敗しました",
        });
    }
};
exports.deleteAlcoholCheck = deleteAlcoholCheck;
