import express from "express";
import { generateStreamToken, upsertStreamUser } from "../lib/stream.js";

const router = express.Router();

router.post("/token", async (req, res) => {
  try {
    const { user } = req.body;
    if (!user || !user.id) {
      return res.status(400).json({ error: "User info required" });
    }

    // Upsert user in Stream (optional but recommended)
    await upsertStreamUser({
      id: user.id,
      name: user.name,
      image: user.image,
    });

    // Generate token
    const token = generateStreamToken(user.id);
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: "Failed to generate Stream token" });
  }
});

export default router;