import { Request, Response, NextFunction } from "express";
import { verifyAuthToken } from "../utils/jwt";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Missing authorization token" });
    }

    const token = header.split(" ")[1];
    const payload = verifyAuthToken(token);
    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

