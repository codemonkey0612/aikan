import bcrypt from "bcryptjs";
import * as UserService from "./user.service";
import type { CreateUserInput, UserRow } from "../models/user.model";
import { signAuthToken } from "../utils/jwt";

const sanitizeUser = (user: UserRow | null) => {
  if (!user) return null;
  const { password_hash, ...rest } = user;
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

  const password_hash = await bcrypt.hash(data.password, 10);
  const user = await UserService.createUser({
    ...data,
    password_hash,
  });

  if (!user) {
    throw httpError("Unable to create user", 500);
  }

  const token = signAuthToken({
    sub: String(user.id),
    role: user.role,
    email: user.email,
  });

  return { token, user: sanitizeUser(user) };
};

export const login = async (email: string, password: string) => {
  if (!email || !password) {
    throw httpError("Email and password are required", 400);
  }

  const user = await UserService.getUserByEmail(email);

  if (!user || !user.password_hash) {
    throw httpError("Invalid credentials", 401);
  }

  const valid = await bcrypt.compare(password, user.password_hash);

  if (!valid) {
    throw httpError("Invalid credentials", 401);
  }

  const token = signAuthToken({
    sub: String(user.id),
    role: user.role,
    email: user.email,
  });

  return { token, user: sanitizeUser(user) };
};

export const getProfile = async (userId: number) => {
  const user = await UserService.getUserById(userId);
  return sanitizeUser(user);
};

