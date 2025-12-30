//backend/src/routes/users.ts
import { Router, Request, Response } from "express";
import User from "../models/User";
import { authMiddleware } from "../middleware/auth";
const router = Router();
// GET /users/me
router.get("/me", authMiddleware, async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ detail: "User not found" });

    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ detail: "Server error" });
  }
});

export default router;
