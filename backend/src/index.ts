// backend/src/index.ts
import express from "express";
import { connectDB, disconnectDB } from "./config/db";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/users";
import expenseRoutes from "./routes/expenses";
import incomeRoutes from "./routes/income";
import dotenv from "dotenv";
import csvRoutes from "./routes/csv";
import predictionRouter from "./routes/predictions";
import bodyParser from "body-parser";
import aiLabelingRoutes from './routes/aiLabeling';
import transactions from "./routes/transactions";
import retrainingRoutes from "./routes/retraining";
import netWorthRoutes from "./routes/networth";



dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const AI_PORT = process.env.AI_PORT || 8001; // Python AI port

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());

// Routes
app.use("/api/predict", predictionRouter);
app.use("/api", csvRoutes);
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/expenses", expenseRoutes);
app.use("/incomes", incomeRoutes);
app.use("/transactions", transactions);
app.use("/api/predict/financial-health", netWorthRoutes);
app.use("/api/charts", require("./routes/charts").default);
app.use("/api/ai-labeling", aiLabelingRoutes);
app.use("/uploads", express.static('uploads'));
app.use("/api/retraining", retrainingRoutes);
//app.use("/api/transactions", require("./routes/transactions").default);
// Health check
app.get("/health", (req, res) => res.send({ status: "OK" }));

// Start server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Backend running on http://localhost:${PORT}`);
      console.log(`Python AI server port ${AI_PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\nShutting down gracefully...");
  await disconnectDB();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\nShutting down gracefully...");
  await disconnectDB();
  process.exit(0);
});

startServer();
