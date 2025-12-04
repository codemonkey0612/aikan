import { redisClient, isRedisAvailable } from "../config/redis";

/**
 * キャッシュキーのプレフィックス
 */
export const CACHE_KEYS = {
  FACILITIES: "facilities:list",
  FACILITY: (id: string) => `facility:${id}`,
  CORPORATIONS: "corporations:list",
  CORPORATION: (id: string) => `corporation:${id}`,
  OPTION_MASTER: "options:master",
  SHIFT_TEMPLATES: "shifts:templates",
  SHIFT_TEMPLATE: (id: number) => `shift:template:${id}`,
  SALARY_RULES: "salaries:rules",
  SALARY_RULE: (id: number) => `salary:rule:${id}`,
} as const;

/**
 * デフォルトのTTL（秒）
 */
const DEFAULT_TTL = 3600; // 1時間

/**
 * キャッシュからデータを取得
 */
export async function getCache<T>(key: string): Promise<T | null> {
  try {
    if (!isRedisAvailable()) {
      return null;
    }
    const data = await redisClient.get(key);
    if (!data) {
      return null;
    }
    return JSON.parse(data) as T;
  } catch (error) {
    // エラーは静かに無視（キャッシュはオプショナル）
    return null;
  }
}

/**
 * キャッシュにデータを保存
 */
export async function setCache<T>(
  key: string,
  value: T,
  ttl: number = DEFAULT_TTL
): Promise<boolean> {
  try {
    if (!isRedisAvailable()) {
      return false;
    }
    const serialized = JSON.stringify(value);
    await redisClient.setEx(key, ttl, serialized);
    return true;
  } catch (error) {
    // エラーは静かに無視（キャッシュはオプショナル）
    return false;
  }
}

/**
 * キャッシュを削除
 */
export async function deleteCache(key: string): Promise<boolean> {
  try {
    if (!isRedisAvailable()) {
      return false;
    }
    await redisClient.del(key);
    return true;
  } catch (error) {
    // エラーは静かに無視（キャッシュはオプショナル）
    return false;
  }
}

/**
 * パターンに一致するキャッシュを削除
 */
export async function deleteCachePattern(pattern: string): Promise<boolean> {
  try {
    if (!isRedisAvailable()) {
      return false;
    }
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
    return true;
  } catch (error) {
    // エラーは静かに無視（キャッシュはオプショナル）
    return false;
  }
}

/**
 * キャッシュを無効化（削除）
 */
export async function invalidateCache(key: string): Promise<void> {
  await deleteCache(key);
}

/**
 * キャッシュまたはデータベースから取得（キャッシュミス時はコールバックを実行）
 */
export async function getOrSetCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl: number = DEFAULT_TTL
): Promise<T> {
  // Redisが利用可能な場合のみキャッシュから取得を試みる
  if (isRedisAvailable()) {
    const cached = await getCache<T>(key);
    if (cached !== null) {
      return cached;
    }
  }

  // キャッシュミスまたはRedisが利用不可の場合、データベースから取得
  const data = await fetchFn();

  // Redisが利用可能な場合のみキャッシュに保存（非同期、エラーは無視）
  if (isRedisAvailable()) {
    setCache(key, data, ttl).catch(() => {
      // エラーは静かに無視
    });
  }

  return data;
}

