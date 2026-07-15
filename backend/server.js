import express from "express";
import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { createServer } from "http";
import { Server } from "socket.io";

import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import chatRoutes from "./routes/chat.route.js";
import messageRoutes from "./routes/message.route.js";
import uploadRoutes from "./routes/upload.route.js";

import Message from "./models/Message.js";
import { connectDB } from "./lib/db.js";
import geminiRoutes from "./routes/gemini.route.js";
import translateRoute from "./routes/translate.js";
import streamRoutes from "./routes/stream.route.js";

const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// ✅ API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/gemini", geminiRoutes);
app.use("/api/translate", translateRoute);
app.use("/api/stream", streamRoutes);

// --- ✅ SOCKET.IO Setup ---
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

const onlineUsers = new Set(); // Track online users
const userSocketMap = {}; // Map userId to socket.id

io.on("connection", (socket) => {
  let userId = socket.handshake.query.userId;

  if (!userId) {
    socket.on("join", (id) => {
      userId = id;
      onlineUsers.add(userId);
      userSocketMap[userId] = socket.id;
      console.log(`✅ User ${userId} connected with socket ID ${socket.id}`);
      io.emit("online-users", Array.from(onlineUsers));
    });
  } else {
    onlineUsers.add(userId);
    userSocketMap[userId] = socket.id;
    io.emit("online-users", Array.from(onlineUsers));
  }

  // ✅ Chat message handling (text + image + file)
  socket.on("sendMessage", async (data) => {
    try {
      console.log("📨 Received message:", data);
      const { senderId, receiverId, text, image, file } = data;

      const message = new Message({
        senderId,
        receiverId,
        text,
        image,
        file,
      });

      await message.save();

      // Emit to receiver (if online) — mark as delivered
      const receiverSocketId = userSocketMap[receiverId];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receiveMessage", message);
      }

      // Emit to sender as confirmation
      socket.emit("receiveMessage", message);
    } catch (err) {
      console.error("❌ Error saving message:", err);
    }
  });

  // ✅ Typing indicator
  socket.on("typing", ({ senderId, receiverId, isTyping }) => {
    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("typing", { senderId, isTyping });
    }
  });

  // ✅ Mark messages as read
  socket.on("markAsRead", async ({ senderId, receiverId }) => {
    try {
      // Update all unread messages from the other user in the DB
      await Message.updateMany(
        { senderId, receiverId, status: { $ne: "read" } },
        { $set: { status: "read" } }
      );

      // Notify the sender that their messages were read
      const senderSocketId = userSocketMap[senderId];
      if (senderSocketId) {
        io.to(senderSocketId).emit("messagesRead", { readBy: receiverId });
      }
    } catch (err) {
      console.error("❌ Error marking messages as read:", err);
    }
  });

  // ✅ Video call request
  socket.on("call-user", ({ from, to }) => {
    const receiverSocketId = userSocketMap[to];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("incoming-call", { from });
    }
  });

  // ✅ WebRTC room-based signaling (scoped to specific call rooms)
  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    console.log(`📹 Socket ${socket.id} joined room ${roomId}`);
  });

  socket.on("leave-room", (roomId) => {
    socket.leave(roomId);
    console.log(`📹 Socket ${socket.id} left room ${roomId}`);
  });

  socket.on("offer", ({ offer, roomId }) => {
    socket.to(roomId).emit("offer", { offer, roomId });
  });

  socket.on("answer", ({ answer, roomId }) => {
    socket.to(roomId).emit("answer", { answer, roomId });
  });

  socket.on("ice-candidate", ({ candidate, roomId }) => {
    socket.to(roomId).emit("ice-candidate", { candidate, roomId });
  });

  // ✅ Handle user disconnect
  socket.on("disconnect", () => {
    if (userId) {
      onlineUsers.delete(userId);
      delete userSocketMap[userId];
      io.emit("online-users", Array.from(onlineUsers));
    }
    console.log("🔌 User disconnected:", socket.id);
  });
});

// ✅ API to fetch online users
app.get("/online-users", (req, res) => {
  res.json({ online: Array.from(onlineUsers) });
});

app.get("/", (req, res) => {
  res.send("✅ Backend is live and DB connected!");
});

// ✅ Start server
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  connectDB();
});
