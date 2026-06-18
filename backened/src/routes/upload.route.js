// routes/upload.route.js
import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";

dotenv.config(); // ✅ load .env if not loaded from server.js

const router = express.Router();

// ✅ Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ Setup storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "chat-files",
    allowed_formats: ["jpg", "png", "pdf", "docx", "mp4"],
  },
});

const upload = multer({ storage });

// ✅ POST /api/upload
router.post("/", upload.single("file"), (req, res) => {
  try {
    res.json({ url: req.file.path }); // Cloudinary file URL
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "File upload failed" });
  }
});

export default router;
