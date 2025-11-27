import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../config/env";

export interface AuthTokenPayload extends jwt.JwtPayload {
  sub: string;
  role: string;
  email?: string | null;
}

export const signAuthToken = (payload: AuthTokenPayload) => {
  const options: SignOptions = {};
  if (env.jwtExpiresIn) {
    options.expiresIn = env.jwtExpiresIn as SignOptions["expiresIn"];
  }

  return jwt.sign(payload, env.jwtSecret as jwt.Secret, options);
};

export const verifyAuthToken = (token: string): AuthTokenPayload => {
  const decoded = jwt.verify(token, env.jwtSecret as jwt.Secret);

  if (typeof decoded === "string") {
    throw new Error("Invalid token payload");
  }

  return decoded as AuthTokenPayload;
};
