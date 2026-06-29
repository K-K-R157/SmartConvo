import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

const router = express.Router();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post("/suggest-replies", async (req, res) => {
  const { message } = req.body;

  if (!message) return res.status(400).json({ error: "Message is required" });

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); // ✅ correct model
// this api is of email id smartboy name and first project name created 7 july 2025
    const prompt = `Give 3 short smart reply suggestions to this message:\n"${message}"`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Extract reply lines
    const suggestions = text
      .split("\n")
      .filter((line) => line.trim())
      .map((line) => line.replace(/^\d+[\).\-]?\s*/, "").trim());

    res.json({ suggestions });
  } catch (error) {
    console.error("Gemini error:", error.message);
    res.status(500).json({ error: "Failed to get smart replies" });
  }
});

export default router;

// AIzaSyCEHsilIhQcqxjQrTrJQJcRK_oXjlR-sNI