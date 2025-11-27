import dotenv from "dotenv";

dotenv.config();

const requiredVars = ["JWT_SECRET"];

requiredVars.forEach((key) => {
  if (!process.env[key]) {
    console.warn(`[env] Missing ${key}. Using fallback defaults where possible.`);
  }
});

export const env = {
  port: Number(process.env.PORT ?? 3001),
  jwtSecret: process.env.JWT_SECRET ?? "dev-secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "1h",
};
