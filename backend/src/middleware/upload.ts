// backend/src/middleware/upload.ts
import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (_, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

export const upload = multer({
  storage,
  fileFilter: (_, file, cb) => {
    if (file.mimetype === "text/csv") cb(null, true);
    else cb(new Error("Only CSV files allowed"));
  },
});
