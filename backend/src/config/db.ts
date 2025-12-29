//backend/src/config/db.ts
import mongoose from "mongoose";

export const connectDB = (uri: string) => {
  mongoose
    .connect(uri)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("MongoDB connection error:", err));
};
