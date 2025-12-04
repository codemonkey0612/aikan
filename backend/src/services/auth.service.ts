import bcrypt from "bcryptjs";
import * as UserService from "./user.service";
import * as RefreshTokenModel from "../models/refreshToken.model";
import type { CreateUserInput, UserRow } from "../models/user.model";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt";
import type { UserRole } from "../types/roles";
import { v4 as uuidv4 } from "uuid";

const sanitizeUser = (user: UserRow | null) => {
  if (!user) return null;
  const { password, ...rest } = user;
  return rest;
};

const httpError = (message: string, status: number) => {
  const error = new Error(message);
  (error as any).status = status;
  return error;
};

export const register = async (
  data: CreateUserInput & { password: string }
) => {
  if (!data.email || !data.password) {
    throw httpError("Email and password are required", 400);
  }

  const existing = await UserService.getUserByEmail(data.email);

  if (existing) {
    throw httpError("Email already in use", 400);
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);
  const user = await UserService.createUser({
    ...data,
    password: hashedPassword,
  });

  if (!user) {
    throw httpError("Unable to create user", 500);
  }

  // アクセストークンを生成
  const accessToken = signAccessToken({
    sub: String(user.id),
    role: user.role as UserRole,
    email: user.email,
  });

  // リフレッシュトークンを生成
  const tokenId = uuidv4();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30日後

  await RefreshTokenModel.createRefreshToken({
    user_id: user.id,
    token: tokenId,
    expires_at: expiresAt,
  });

  const refreshToken = signRefreshToken(String(user.id), tokenId);

  return {
    accessToken,
    refreshToken,
    user: sanitizeUser(user),
  };
};

export const login = async (email: string, password: string) => {
  if (!email || !password) {
    throw httpError("Email and password are required", 400);
  }

  const user = await UserService.getUserByEmail(email);

  if (!user || !user.password) {
    throw httpError("Invalid credentials", 401);
  }

  const valid = await bcrypt.compare(password, user.password);

  if (!valid) {
    throw httpError("Invalid credentials", 401);
  }

  // アクセストークンを生成
  const accessToken = signAccessToken({
    sub: String(user.id),
    role: user.role as UserRole,
    email: user.email,
  });

  // リフレッシュトークンを生成
  const tokenId = uuidv4();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30日後

  await RefreshTokenModel.createRefreshToken({
    user_id: user.id,
    token: tokenId,
    expires_at: expiresAt,
  });

  const refreshToken = signRefreshToken(String(user.id), tokenId);

  return {
    accessToken,
    refreshToken,
    user: sanitizeUser(user),
  };
};

export const getProfile = async (userId: number) => {
  const user = await UserService.getUserById(userId);
  if (!user) {
    throw httpError("User not found", 404);
  }
  return sanitizeUser(user);
};

/**
 * プロフィール更新
 */
export const updateProfile = async (
  userId: number,
  data: {
    first_name?: string | null;
    last_name?: string | null;
    email?: string | null;
    phone_number?: string | null;
  }
) => {
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

  const updated = await UserService.updateUser(userId, data);
  return sanitizeUser(updated);
};

/**
 * パスワード変更
 */
export const changePassword = async (
  userId: number,
  currentPassword: string,
  newPassword: string
) => {
  const user = await UserService.getUserById(userId);
  if (!user || !user.password) {
    throw httpError("User not found", 404);
  }

  // 現在のパスワードを検証
  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) {
    throw httpError("現在のパスワードが正しくありません", 401);
  }

  // 新しいパスワードをハッシュ化
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // パスワードを更新
  await UserService.updateUser(userId, { password: hashedPassword });

  return { message: "パスワードが変更されました" };
};

/**
 * リフレッシュトークンを使用して新しいアクセストークンを取得（トークンローテーション）
 */
export const refreshAccessToken = async (refreshTokenString: string) => {
  // リフレッシュトークンを検証
  const payload = verifyRefreshToken(refreshTokenString);

  // データベースからリフレッシュトークンを取得
  const refreshTokenRecord = await RefreshTokenModel.getRefreshTokenByToken(
    payload.tokenId
  );

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
  const accessToken = signAccessToken({
    sub: String(user.id),
    role: user.role as UserRole,
    email: user.email,
  });

  // 新しいリフレッシュトークンを生成
  const newTokenId = uuidv4();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30日後

  await RefreshTokenModel.createRefreshToken({
    user_id: user.id,
    token: newTokenId,
    expires_at: expiresAt,
  });

  const newRefreshToken = signRefreshToken(String(user.id), newTokenId);

  return {
    accessToken,
    refreshToken: newRefreshToken,
    user: sanitizeUser(user),
  };
};

/**
 * リフレッシュトークンを無効化（ログアウト）
 */
export const revokeRefreshToken = async (refreshTokenString: string) => {
  try {
    const payload = verifyRefreshToken(refreshTokenString);
    await RefreshTokenModel.revokeRefreshToken(payload.tokenId);
  } catch (error) {
    // トークンが無効でもエラーを投げない（既に無効化されている可能性がある）
  }
};

/**
 * ユーザーのすべてのリフレッシュトークンを無効化（ログアウト全デバイス）
 */
export const revokeAllRefreshTokens = async (userId: number) => {
  await RefreshTokenModel.revokeAllRefreshTokensByUserId(userId);
};

