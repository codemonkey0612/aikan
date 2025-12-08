"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRedisAvailable = exports.disconnectRedis = exports.connectRedis = exports.redisClient = void 0;
const redis_1 = require("redis");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
exports.redisClient = (0, redis_1.createClient)({
    url: redisUrl,
    socket: {
        reconnectStrategy: (retries) => {
            // リトライ回数を制限（最大3回）
            if (retries > 3) {
                console.warn("Redis接続を諦めました。キャッシュ機能は無効です。");
                return new Error("Redis接続に失敗しました");
            }
            // 指数バックオフ: 1秒、2秒、4秒
            return Math.min(retries * 1000, 4000);
        },
    },
});
let connectionAttempted = false;
let connectionErrorLogged = false;
exports.redisClient.on("error", (err) => {
    // 接続エラーは一度だけログに記録
    if (!connectionErrorLogged) {
        console.warn("Redis接続エラー:", err.message);
        console.warn("キャッシュ機能は無効です。アプリケーションは正常に動作します。");
        connectionErrorLogged = true;
    }
});
exports.redisClient.on("connect", () => {
    console.log("✓ Redis接続が確立されました");
    connectionErrorLogged = false;
});
exports.redisClient.on("ready", () => {
    console.log("✓ Redis準備完了");
});
exports.redisClient.on("reconnecting", () => {
    console.log("Redis再接続中...");
});
// 接続を確立（非同期）
const connectRedis = async () => {
    // 既に接続試行済みの場合はスキップ
    if (connectionAttempted) {
        return;
    }
    connectionAttempted = true;
    try {
        if (!exports.redisClient.isOpen) {
            await exports.redisClient.connect();
            console.log("✓ Redis接続成功");
        }
    }
    catch (error) {
        // 接続失敗は警告のみ（アプリケーションは続行）
        if (!connectionErrorLogged) {
            console.warn("⚠ Redis接続に失敗しました:", error.message);
            console.warn("⚠ キャッシュ機能は無効です。アプリケーションは正常に動作します。");
            console.warn("⚠ Redisを起動するか、REDIS_URL環境変数を確認してください。");
            connectionErrorLogged = true;
        }
    }
};
exports.connectRedis = connectRedis;
// 接続を閉じる
const disconnectRedis = async () => {
    try {
        if (exports.redisClient.isOpen) {
            await exports.redisClient.quit();
            console.log("Redis接続を閉じました");
        }
    }
    catch (error) {
        console.error("Redis切断エラー:", error);
    }
};
exports.disconnectRedis = disconnectRedis;
// Redisが利用可能かどうかをチェック
const isRedisAvailable = () => {
    return exports.redisClient.isOpen;
};
exports.isRedisAvailable = isRedisAvailable;
