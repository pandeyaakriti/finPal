// backend/src/routes/predictions.ts
import { Router, Request, Response } from "express";
import axios from "axios";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  const { text } = req.body;

  try {
    const response = await axios.post("http://localhost:8001/predict", { text });
    res.json(response.data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Prediction failed" });
  }
});

export default router;
