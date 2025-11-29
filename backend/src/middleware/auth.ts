// middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const authMiddleware = (req: any, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ detail: "Token missing" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ detail: "Token missing" });

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    req.userId = decoded.id; // attach userId to req
    next();
  } catch (err) {
    return res.status(401).json({ detail: "Invalid token" });
  }
};
