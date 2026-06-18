import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post("/", async (req, res) => {
  const { text, targetLang } = req.body;

  if (!text || !targetLang) {
    return res.status(400).json({ error: "Text and targetLang are required" });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `Translate the following text to ${targetLang}:\n"${text}"`;

    const result = await model.generateContent(prompt);
    const translatedText = result.response.text();

    res.json({ translated: translatedText.trim() });
  } catch (error) {
    console.error("Translation error:", error.message);
    res.status(500).json({ error: "Translation failed" });
  }
});

export default router;
