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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.revokeAllRefreshTokens = exports.revokeRefreshToken = exports.refreshAccessToken = exports.changePassword = exports.updateProfile = exports.getProfile = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const UserService = __importStar(require("./user.service"));
const RefreshTokenModel = __importStar(require("../models/refreshToken.model"));
const jwt_1 = require("../utils/jwt");
const uuid_1 = require("uuid");
const sanitizeUser = (user) => {
    if (!user)
        return null;
    const { password, ...rest } = user;
    return rest;
};
const httpError = (message, status) => {
    const error = new Error(message);
    error.status = status;
    return error;
};
const register = async (data) => {
    if (!data.email || !data.password) {
        throw httpError("Email and password are required", 400);
    }
    const existing = await UserService.getUserByEmail(data.email);
    if (existing) {
        throw httpError("Email already in use", 400);
    }
    const hashedPassword = await bcryptjs_1.default.hash(data.password, 10);
    const user = await UserService.createUser({
        ...data,
        password: hashedPassword,
    });
    if (!user) {
        throw httpError("Unable to create user", 500);
    }
    // アクセストークンを生成
    const accessToken = (0, jwt_1.signAccessToken)({
        sub: String(user.id),
        role: user.role,
        email: user.email,
    });
    // リフレッシュトークンを生成
    const tokenId = (0, uuid_1.v4)();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30日後
    await RefreshTokenModel.createRefreshToken({
        user_id: user.id,
        token: tokenId,
        expires_at: expiresAt,
    });
    const refreshToken = (0, jwt_1.signRefreshToken)(String(user.id), tokenId);
    return {
        accessToken,
        refreshToken,
        user: sanitizeUser(user),
    };
};
exports.register = register;
const login = async (email, password) => {
    if (!email || !password) {
        throw httpError("Email and password are required", 400);
    }
    const user = await UserService.getUserByEmail(email);
    if (!user || !user.password) {
        throw httpError("Invalid credentials", 401);
    }
    const valid = await bcryptjs_1.default.compare(password, user.password);
    if (!valid) {
        throw httpError("Invalid credentials", 401);
    }
    // アクセストークンを生成
    const accessToken = (0, jwt_1.signAccessToken)({
        sub: String(user.id),
        role: user.role,
        email: user.email,
    });
    // リフレッシュトークンを生成
    const tokenId = (0, uuid_1.v4)();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30日後
    await RefreshTokenModel.createRefreshToken({
        user_id: user.id,
        token: tokenId,
        expires_at: expiresAt,
    });
    const refreshToken = (0, jwt_1.signRefreshToken)(String(user.id), tokenId);
    return {
        accessToken,
        refreshToken,
        user: sanitizeUser(user),
    };
};
exports.login = login;
const getProfile = async (userId) => {
    const user = await UserService.getUserById(userId);
    if (!user) {
        throw httpError("User not found", 404);
    }
    return sanitizeUser(user);
};
exports.getProfile = getProfile;
/**
 * プロフィール更新
 */
const updateProfile = async (userId, data) => {
    const user = await UserService.getUserById(userId);
    if (!user) {
        throw httpError("User not found", 404);
    }
    // メールアドレスが変更される場合、重複チェック
    if (data.email && data.email !== user.email) {
        const existing = await UserService.getUserByEmail(data.email);
        if (existing && existing.id !== userId) {
            throw httpError("このメールアドレスは既に使用されています", 400);
        }
    }
    const updated = await UserService.updateUser(userId, {
        first_name: data.first_name ?? undefined,
        last_name: data.last_name ?? undefined,
        email: data.email ?? undefined,
        phone_number: data.phone_number ?? undefined,
    });
    return sanitizeUser(updated);
};
exports.updateProfile = updateProfile;
/**
 * パスワード変更
 */
const changePassword = async (userId, currentPassword, newPassword) => {
    const user = await UserService.getUserById(userId);
    if (!user || !user.password) {
        throw httpError("User not found", 404);
    }
    // 現在のパスワードを検証
    const valid = await bcryptjs_1.default.compare(currentPassword, user.password);
    if (!valid) {
        throw httpError("現在のパスワードが正しくありません", 401);
    }
    // 新しいパスワードをハッシュ化
    const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
    // パスワードを更新
    await UserService.updateUser(userId, { password: hashedPassword });
    return { message: "パスワードが変更されました" };
};
exports.changePassword = changePassword;
/**
 * リフレッシュトークンを使用して新しいアクセストークンを取得（トークンローテーション）
 */
const refreshAccessToken = async (refreshTokenString) => {
    // リフレッシュトークンを検証
    const payload = (0, jwt_1.verifyRefreshToken)(refreshTokenString);
    // データベースからリフレッシュトークンを取得
    const refreshTokenRecord = await RefreshTokenModel.getRefreshTokenByToken(payload.tokenId);
    if (!refreshTokenRecord) {
        throw httpError("Refresh token not found", 401);
    }
    if (refreshTokenRecord.revoked === 1) {
        throw httpError("Refresh token has been revoked", 401);
    }
    if (new Date(refreshTokenRecord.expires_at) < new Date()) {
        throw httpError("Refresh token has expired", 401);
    }
    // ユーザー情報を取得
    const user = await UserService.getUserById(Number(payload.sub));
    if (!user) {
        throw httpError("User not found", 404);
    }
    // 古いリフレッシュトークンを削除（トークンローテーション）
    await RefreshTokenModel.deleteRefreshToken(payload.tokenId);
    // 新しいアクセストークンを生成
    const accessToken = (0, jwt_1.signAccessToken)({
        sub: String(user.id),
        role: user.role,
        email: user.email,
    });
    // 新しいリフレッシュトークンを生成
    const newTokenId = (0, uuid_1.v4)();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30日後
    await RefreshTokenModel.createRefreshToken({
        user_id: user.id,
        token: newTokenId,
        expires_at: expiresAt,
    });
    const newRefreshToken = (0, jwt_1.signRefreshToken)(String(user.id), newTokenId);
    return {
        accessToken,
        refreshToken: newRefreshToken,
        user: sanitizeUser(user),
    };
};
exports.refreshAccessToken = refreshAccessToken;
/**
 * リフレッシュトークンを無効化（ログアウト）
 */
const revokeRefreshToken = async (refreshTokenString) => {
    try {
        const payload = (0, jwt_1.verifyRefreshToken)(refreshTokenString);
        await RefreshTokenModel.revokeRefreshToken(payload.tokenId);
    }
    catch (error) {
        // トークンが無効でもエラーを投げない（既に無効化されている可能性がある）
    }
};
exports.revokeRefreshToken = revokeRefreshToken;
/**
 * ユーザーのすべてのリフレッシュトークンを無効化（ログアウト全デバイス）
 */
const revokeAllRefreshTokens = async (userId) => {
    await RefreshTokenModel.revokeAllRefreshTokensByUserId(userId);
};
exports.revokeAllRefreshTokens = revokeAllRefreshTokens;
