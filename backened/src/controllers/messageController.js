import Message from "../models/Message.js";

// Save a new message
export const createMessage = async (req, res) => {
  try {
    const { senderId, receiverId, text, image } = req.body;
    const message = new Message({ senderId, receiverId, text, image });
    await message.save();
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: "Failed to send message" });
  }
};

// Get messages between two users (for infinite scroll, add pagination)
export const getMessages = async (req, res) => {
  try {
    const { userId, otherUserId, limit = 20, before } = req.query;
    const query = {
      $or: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId },
      ],
    };
    if (before) {
      query._id = { $lt: before };
    }
    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit));
    res.json(messages.reverse());
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};

