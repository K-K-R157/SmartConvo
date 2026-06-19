


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

// ✅ Serve static frontend files in production
// if (process.env.NODE_ENV === "production") {
//   app.use(express.static(path.join(__dirname, "../frontend/dist")));
//   app.get("*", (req, res) => {
//     res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
//   });
// }

// --- ✅ SOCKET.IO Setup done ---
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

const onlineUsers = new Set();      // To track online users
const userSocketMap = {};           // Map userId to socket.id

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
        file, // ✅ Add file if exists
      });

      await message.save();

      // 🔁 Emit to receiver (if online)
      const receiverSocketId = userSocketMap[receiverId];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receiveMessage", message);
      }

      // ✅ Emit to sender as confirmation
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

  // ✅ Video call request
  socket.on("call-user", ({ from, to }) => {
    const receiverSocketId = userSocketMap[to];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("incoming-call", { from });
    }
  });

  // ✅ WebRTC signals
  socket.on("offer", (offer) => socket.broadcast.emit("offer", offer));
  socket.on("answer", (answer) => socket.broadcast.emit("answer", answer));
  socket.on("ice-candidate", (candidate) => socket.broadcast.emit("ice-candidate", candidate));

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










// below is same as above below is after vercel


// import express from "express";
// import "dotenv/config";
// import cookieParser from "cookie-parser";
// import cors from "cors";
// import path from "path";
// import { createServer } from "http";
// import { Server } from "socket.io";

// import authRoutes from "./routes/auth.route.js";
// import userRoutes from "./routes/user.route.js";
// import chatRoutes from "./routes/chat.route.js";
// import messageRoutes from "./routes/message.route.js";
// import uploadRoutes from "./routes/upload.route.js";

// import Message from "./models/Message.js";
// import { connectDB } from "./lib/db.js";
// import geminiRoutes from "./routes/gemini.route.js";
// import translateRoute from "./routes/translate.js";
// import streamRoutes from "./routes/stream.route.js";

// const app = express();
// const PORT = process.env.PORT || 5000;
// const __dirname = path.resolve();

// // Allowed origins for CORS
// const allowedOrigins = [
//   "http://localhost:5173",
//   "https://convo-k04ic9ogs-priyanshu886291kumars-projects.vercel.app",
// ];

// app.use(
//   cors({
//     origin: function (origin, callback) {
//       // Allow requests with no origin (like Postman or curl)
//       if (!origin) return callback(null, true);
//       if (allowedOrigins.indexOf(origin) === -1) {
//         const msg = `CORS policy does not allow access from origin ${origin}`;
//         return callback(new Error(msg), false);
//       }
//       return callback(null, true);
//     },
//     credentials: true,
//   })
// );

// app.use(express.json());
// app.use(cookieParser());

// // API routes
// app.use("/api/auth", authRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/chat", chatRoutes);
// app.use("/api/messages", messageRoutes);
// app.use("/api/upload", uploadRoutes);
// app.use("/api/gemini", geminiRoutes);
// app.use("/api/translate", translateRoute);
// app.use("/api/stream", streamRoutes);

// // Serve frontend files in production (uncomment if needed)
// // if (process.env.NODE_ENV === "production") {
// //   app.use(express.static(path.join(__dirname, "../frontend/dist")));
// //   app.get("*", (req, res) => {
// //     res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
// //   });
// // }

// // Socket.io setup with CORS
// const server = createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: allowedOrigins,
//     credentials: true,
//   },
// });

// const onlineUsers = new Set();
// const userSocketMap = {};

// io.on("connection", (socket) => {
//   let userId = socket.handshake.query.userId;

//   if (!userId) {
//     socket.on("join", (id) => {
//       userId = id;
//       onlineUsers.add(userId);
//       userSocketMap[userId] = socket.id;
//       console.log(`✅ User ${userId} connected with socket ID ${socket.id}`);
//       io.emit("online-users", Array.from(onlineUsers));
//     });
//   } else {
//     onlineUsers.add(userId);
//     userSocketMap[userId] = socket.id;
//     io.emit("online-users", Array.from(onlineUsers));
//   }

//   socket.on("sendMessage", async (data) => {
//     try {
//       console.log("📨 Received message:", data);
//       const { senderId, receiverId, text, image, file } = data;

//       const message = new Message({
//         senderId,
//         receiverId,
//         text,
//         image,
//         file,
//       });

//       await message.save();

//       const receiverSocketId = userSocketMap[receiverId];
//       if (receiverSocketId) {
//         io.to(receiverSocketId).emit("receiveMessage", message);
//       }

//       socket.emit("receiveMessage", message);
//     } catch (err) {
//       console.error("❌ Error saving message:", err);
//     }
//   });

//   socket.on("typing", ({ senderId, receiverId, isTyping }) => {
//     const receiverSocketId = userSocketMap[receiverId];
//     if (receiverSocketId) {
//       io.to(receiverSocketId).emit("typing", { senderId, isTyping });
//     }
//   });

//   socket.on("call-user", ({ from, to }) => {
//     const receiverSocketId = userSocketMap[to];
//     if (receiverSocketId) {
//       io.to(receiverSocketId).emit("incoming-call", { from });
//     }
//   });

//   socket.on("offer", (offer) => socket.broadcast.emit("offer", offer));
//   socket.on("answer", (answer) => socket.broadcast.emit("answer", answer));
//   socket.on("ice-candidate", (candidate) =>
//     socket.broadcast.emit("ice-candidate", candidate)
//   );

//   socket.on("disconnect", () => {
//     if (userId) {
//       onlineUsers.delete(userId);
//       delete userSocketMap[userId];
//       io.emit("online-users", Array.from(onlineUsers));
//     }
//     console.log("🔌 User disconnected:", socket.id);
//   });
// });

// // API endpoint to get online users
// app.get("/online-users", (req, res) => {
//   res.json({ online: Array.from(onlineUsers) });
// });

// // Start server
// server.listen(PORT, "0.0.0.0", () => {
//   console.log(`🚀 Server is running on port ${PORT}`);
//   connectDB();
// });
