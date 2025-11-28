import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

export const redisClient = createClient({
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

redisClient.on("error", (err) => {
  // 接続エラーは一度だけログに記録
  if (!connectionErrorLogged) {
    console.warn("Redis接続エラー:", err.message);
    console.warn("キャッシュ機能は無効です。アプリケーションは正常に動作します。");
    connectionErrorLogged = true;
  }
});

redisClient.on("connect", () => {
  console.log("✓ Redis接続が確立されました");
  connectionErrorLogged = false;
});

redisClient.on("ready", () => {
  console.log("✓ Redis準備完了");
});

redisClient.on("reconnecting", () => {
  console.log("Redis再接続中...");
});

// 接続を確立（非同期）
export const connectRedis = async () => {
  // 既に接続試行済みの場合はスキップ
  if (connectionAttempted) {
    return;
  }

  connectionAttempted = true;

  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
      console.log("✓ Redis接続成功");
    }
  } catch (error: any) {
    // 接続失敗は警告のみ（アプリケーションは続行）
    if (!connectionErrorLogged) {
      console.warn("⚠ Redis接続に失敗しました:", error.message);
      console.warn("⚠ キャッシュ機能は無効です。アプリケーションは正常に動作します。");
      console.warn("⚠ Redisを起動するか、REDIS_URL環境変数を確認してください。");
      connectionErrorLogged = true;
    }
  }
};

// 接続を閉じる
export const disconnectRedis = async () => {
  try {
    if (redisClient.isOpen) {
      await redisClient.quit();
      console.log("Redis接続を閉じました");
    }
  } catch (error) {
    console.error("Redis切断エラー:", error);
  }
};

// Redisが利用可能かどうかをチェック
export const isRedisAvailable = (): boolean => {
  return redisClient.isOpen;
};

