import { Router, Request, Response } from "express";
import User from "../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client, TokenPayload } from "google-auth-library";
//import authMiddleware from "../middleware/auth";

const router = Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ---------------- Email/password signup ----------------
router.post("/signup", async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ detail: "Email already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashed });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, { expiresIn: "7d" });
    res.json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ detail: "Server error" });
  }
});

// ---------------- Email/password login ----------------
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !user.password)
      return res.status(400).json({ detail: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ detail: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, { expiresIn: "7d" });
    res.json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ detail: "Server error" });
  }
});

// ---------------- Google login ----------------
router.post("/google-login", async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ detail: "Token missing" });

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload: TokenPayload | undefined = ticket.getPayload();
    if (!payload?.email) throw new Error("Invalid Google token");

    // Find or create user
    let user = await User.findOne({ email: payload.email });
    if (!user) {
      user = await User.create({
        email: payload.email,
        username: payload.name || "GoogleUser",
        googleId: payload.sub,
      });
    }

    const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, { expiresIn: "7d" });
    res.json({ token: jwtToken, user });
  } catch (err: any) {
    console.error(err);
    res.status(400).json({ detail: err.message || "Google login failed" });
  }
});


export default router;
