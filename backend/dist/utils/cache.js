"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CACHE_KEYS = void 0;
exports.getCache = getCache;
exports.setCache = setCache;
exports.deleteCache = deleteCache;
exports.deleteCachePattern = deleteCachePattern;
exports.invalidateCache = invalidateCache;
exports.getOrSetCache = getOrSetCache;
const redis_1 = require("../config/redis");
/**
 * キャッシュキーのプレフィックス
 */
exports.CACHE_KEYS = {
    FACILITIES: "facilities:list",
    FACILITY: (id) => `facility:${id}`,
    CORPORATIONS: "corporations:list",
    CORPORATION: (id) => `corporation:${id}`,
    OPTION_MASTER: "options:master",
    SHIFT_TEMPLATES: "shifts:templates",
    SHIFT_TEMPLATE: (id) => `shift:template:${id}`,
    SALARY_RULES: "salaries:rules",
    SALARY_RULE: (id) => `salary:rule:${id}`,
};
/**
 * デフォルトのTTL（秒）
 */
const DEFAULT_TTL = 3600; // 1時間
/**
 * キャッシュからデータを取得
 */
async function getCache(key) {
    try {
        if (!(0, redis_1.isRedisAvailable)()) {
            return null;
        }
        const data = await redis_1.redisClient.get(key);
        if (!data) {
            return null;
        }
        return JSON.parse(data);
    }
    catch (error) {
        // エラーは静かに無視（キャッシュはオプショナル）
        return null;
    }
}
/**
 * キャッシュにデータを保存
 */
async function setCache(key, value, ttl = DEFAULT_TTL) {
    try {
        if (!(0, redis_1.isRedisAvailable)()) {
            return false;
        }
        const serialized = JSON.stringify(value);
        await redis_1.redisClient.setEx(key, ttl, serialized);
        return true;
    }
    catch (error) {
        // エラーは静かに無視（キャッシュはオプショナル）
        return false;
    }
}
/**
 * キャッシュを削除
 */
async function deleteCache(key) {
    try {
        if (!(0, redis_1.isRedisAvailable)()) {
            return false;
        }
        await redis_1.redisClient.del(key);
        return true;
    }
    catch (error) {
        // エラーは静かに無視（キャッシュはオプショナル）
        return false;
    }
}
/**
 * パターンに一致するキャッシュを削除
 */
async function deleteCachePattern(pattern) {
    try {
        if (!(0, redis_1.isRedisAvailable)()) {
            return false;
        }
        const keys = await redis_1.redisClient.keys(pattern);
        if (keys.length > 0) {
            await redis_1.redisClient.del(keys);
        }
        return true;
    }
    catch (error) {
        // エラーは静かに無視（キャッシュはオプショナル）
        return false;
    }
}
/**
 * キャッシュを無効化（削除）
 */
async function invalidateCache(key) {
    await deleteCache(key);
}
/**
 * キャッシュまたはデータベースから取得（キャッシュミス時はコールバックを実行）
 */
async function getOrSetCache(key, fetchFn, ttl = DEFAULT_TTL) {
    // Redisが利用可能な場合のみキャッシュから取得を試みる
    if ((0, redis_1.isRedisAvailable)()) {
        const cached = await getCache(key);
        if (cached !== null) {
            return cached;
        }
    }
    // キャッシュミスまたはRedisが利用不可の場合、データベースから取得
    const data = await fetchFn();
    // Redisが利用可能な場合のみキャッシュに保存（非同期、エラーは無視）
    if ((0, redis_1.isRedisAvailable)()) {
        setCache(key, data, ttl).catch(() => {
            // エラーは静かに無視
        });
    }
    return data;
}
