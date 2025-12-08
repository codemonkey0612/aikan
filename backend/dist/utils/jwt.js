"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyAuthToken = exports.signAuthToken = exports.verifyRefreshToken = exports.verifyAccessToken = exports.signRefreshToken = exports.signAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
/**
 * アクセストークンを生成（15分）
 */
const signAccessToken = (payload) => {
    const options = {
        expiresIn: env_1.env.jwtExpiresIn,
    };
    return jsonwebtoken_1.default.sign({ ...payload, type: "access" }, env_1.env.jwtSecret, options);
};
exports.signAccessToken = signAccessToken;
/**
 * リフレッシュトークンを生成（30日）
 */
const signRefreshToken = (userId, tokenId) => {
    const payload = {
        sub: userId,
        tokenId,
        type: "refresh",
    };
    const options = {
        expiresIn: env_1.env.jwtRefreshExpiresIn,
    };
    return jsonwebtoken_1.default.sign(payload, env_1.env.jwtRefreshSecret, options);
};
exports.signRefreshToken = signRefreshToken;
/**
 * アクセストークンを検証
 */
const verifyAccessToken = (token) => {
    const decoded = jsonwebtoken_1.default.verify(token, env_1.env.jwtSecret);
    if (typeof decoded === "string") {
        throw new Error("Invalid token payload");
    }
    const payload = decoded;
    if (payload.type && payload.type !== "access") {
        throw new Error("Invalid token type");
    }
    return payload;
};
exports.verifyAccessToken = verifyAccessToken;
/**
 * リフレッシュトークンを検証
 */
const verifyRefreshToken = (token) => {
    const decoded = jsonwebtoken_1.default.verify(token, env_1.env.jwtRefreshSecret);
    if (typeof decoded === "string") {
        throw new Error("Invalid token payload");
    }
    const payload = decoded;
    if (payload.type !== "refresh") {
        throw new Error("Invalid token type");
    }
    return payload;
};
exports.verifyRefreshToken = verifyRefreshToken;
// 後方互換性のため
exports.signAuthToken = exports.signAccessToken;
exports.verifyAuthToken = exports.verifyAccessToken;
