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
exports.changePassword = exports.updateProfile = exports.logout = exports.refresh = exports.me = exports.login = exports.register = void 0;
const AuthService = __importStar(require("../services/auth.service"));
const register = async (req, res) => {
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
    }
    catch (error) {
        const status = error.status || 500;
        res.status(status).json({
            message: error.message || "登録に失敗しました",
        });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await AuthService.login(email, password);
        res.json(result);
    }
    catch (error) {
        const status = error.status || 500;
        res.status(status).json({
            message: error.message || "ログインに失敗しました",
        });
    }
};
exports.login = login;
const me = async (req, res) => {
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
    }
    catch (error) {
        const status = error.status || 500;
        res.status(status).json({
            message: error.message || "プロフィールの取得に失敗しました",
        });
    }
};
exports.me = me;
const refresh = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        const result = await AuthService.refreshAccessToken(refreshToken);
        res.json(result);
    }
    catch (error) {
        const status = error.status || 500;
        res.status(status).json({
            message: error.message || "トークンのリフレッシュに失敗しました",
        });
    }
};
exports.refresh = refresh;
const logout = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (refreshToken) {
            await AuthService.revokeRefreshToken(refreshToken);
        }
        res.json({ message: "ログアウトしました" });
    }
    catch (error) {
        const status = error.status || 500;
        res.status(status).json({
            message: error.message || "ログアウトに失敗しました",
        });
    }
};
exports.logout = logout;
const updateProfile = async (req, res) => {
    try {
        const userId = req.user?.sub ? Number(req.user.sub) : undefined;
        if (!userId) {
            return res.status(401).json({ message: "認証が必要です" });
        }
        const updated = await AuthService.updateProfile(userId, req.body);
        res.json(updated);
    }
    catch (error) {
        const status = error.status || 500;
        res.status(status).json({
            message: error.message || "プロフィールの更新に失敗しました",
        });
    }
};
exports.updateProfile = updateProfile;
const changePassword = async (req, res) => {
    try {
        const userId = req.user?.sub ? Number(req.user.sub) : undefined;
        if (!userId) {
            return res.status(401).json({ message: "認証が必要です" });
        }
        const { current_password, new_password } = req.body;
        const result = await AuthService.changePassword(userId, current_password, new_password);
        res.json(result);
    }
    catch (error) {
        const status = error.status || 500;
        res.status(status).json({
            message: error.message || "パスワードの変更に失敗しました",
        });
    }
};
exports.changePassword = changePassword;
