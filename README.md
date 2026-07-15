# SmartConvo 💬

A full-stack real-time chat and video calling platform built with the MERN stack, featuring AI-powered smart replies, language translation, and peer-to-peer video calling.

## ✨ Features

### Core
- **JWT Cookie Authentication** — Secure login/signup with HTTP-only cookies
- **Real-Time Messaging** — Instant chat powered by Socket.IO & WebSockets
- **Friend Request System** — Send, accept, and manage friend requests
- **Online Presence** — Live green-dot indicators for online users

### Communication
- **WebRTC Video Calling (Quick Call)** — Peer-to-peer video with TURN server support
- **Stream SDK Video (HD Call)** — Production-grade HD video with screen sharing
- **Typing Indicators** — Real-time "is typing..." status
- **Read Receipts** — Message status: ✓ Sent → ✓✓ Delivered → ✓✓ Read (blue)

### AI Features
- **Gemini Smart Replies** — AI-generated reply suggestions based on incoming messages
- **Real-Time Translation** — Translate messages to Hindi, Spanish, French, Bengali on the fly

### Media & UX
- **Cloudinary File Uploads** — Share images and files in chat
- **Voice Typing** — Speech-to-text input using browser Speech Recognition API
- **Infinite Chat Scrolling** — Cursor-based pagination for message history
- **32 Themes** — Switchable DaisyUI themes with persistence
- **Responsive Design** — Mobile, tablet, and desktop layouts

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React, Vite, TailwindCSS, DaisyUI |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB, Mongoose |
| **Real-Time** | Socket.IO, WebSockets |
| **Video** | WebRTC (peer-to-peer), Stream Video SDK |
| **AI** | Google Gemini API |
| **Auth** | JWT (HTTP-only cookies) |
| **Media** | Cloudinary |
| **State** | Zustand, React Query |

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+
- **MongoDB** (local or Atlas)
- Free API keys (see below)

### 1. Clone the repo
```bash
git clone https://github.com/your-username/SmartConvo.git
cd SmartConvo
```

### 2. Install dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Set up environment variables

Copy the example files and fill in your keys:

```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env
```

#### Required API Keys (all FREE):

| Key | Where to Get |
|---|---|
| **Gemini API Key** | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) |
| **Cloudinary** | [cloudinary.com/console](https://cloudinary.com/console) |
| **Stream** | [getstream.io/dashboard](https://getstream.io/dashboard) |

### 4. Seed the database (optional)
```bash
cd backend
npm run seed
```
Creates 10 test users with friendships and messages. Password for all: `password123`

### 5. Run the app
```bash
# Terminal 1 — Backend
cd backend
npm start

# Terminal 2 — Frontend
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 📁 Project Structure

```
SmartConvo/
├── backend/
│   ├── controllers/      # Route handlers (auth, user, chat)
│   ├── middleware/        # JWT auth middleware
│   ├── models/            # Mongoose schemas (User, Message, FriendRequest)
│   ├── routes/            # API routes (auth, users, messages, gemini, upload)
│   ├── lib/               # DB connection, Stream client
│   ├── server.js          # Express + Socket.IO server
│   └── seed.js            # Database seeder
├── frontend/
│   ├── src/
│   │   ├── components/    # ChatContainer, VideoCall, Sidebar, Navbar, etc.
│   │   ├── pages/         # Login, SignUp, Onboarding, Call, Friends, etc.
│   │   ├── hooks/         # useAuthUser, useSocket, useLogin, useSignUp
│   │   ├── store/         # Zustand stores (chat, theme)
│   │   └── lib/           # Axios instance, API functions
│   └── index.html
└── .gitignore
```

## 📜 License

This project is open source and available under the [MIT License](LICENSE).
