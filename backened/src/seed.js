import mongoose from "mongoose";
import "dotenv/config";
import bcrypt from "bcryptjs";

import User from "./models/User.js";
import FriendRequest from "./models/FriendRequest.js";
import Message from "./models/Message.js";

// ─── Dummy Indian Users ───────────────────────────────────────────────────────
const USERS = [
  {
    fullName: "Aarav Sharma",
    email: "aarav@example.com",
    password: "password123",
    bio: "Delhi guy learning Japanese for my anime obsession 🇯🇵 | Software Dev",
    profilePic: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aarav",
    nativeLanguage: "Hindi",
    learningLanguage: "Japanese",
    location: "New Delhi, India",
    isOnboarded: true,
  },
  {
    fullName: "Priya Nair",
    email: "priya@example.com",
    password: "password123",
    bio: "Kochi girl, learning French for my Paris dream trip 🗼 | Teacher",
    profilePic: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
    nativeLanguage: "Malayalam",
    learningLanguage: "French",
    location: "Kochi, Kerala",
    isOnboarded: true,
  },
  {
    fullName: "Rohan Mehta",
    email: "rohan@example.com",
    password: "password123",
    bio: "Mumbai startup founder learning Mandarin for business 💼 | Entrepreneur",
    profilePic: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rohan",
    nativeLanguage: "Gujarati",
    learningLanguage: "Mandarin",
    location: "Mumbai, Maharashtra",
    isOnboarded: true,
  },
  {
    fullName: "Sneha Reddy",
    email: "sneha@example.com",
    password: "password123",
    bio: "Hyderabad CS student, practicing Spanish for exchange program 🇪🇸",
    profilePic: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha",
    nativeLanguage: "Telugu",
    learningLanguage: "Spanish",
    location: "Hyderabad, Telangana",
    isOnboarded: true,
  },
  {
    fullName: "Vikram Singh",
    email: "vikram@example.com",
    password: "password123",
    bio: "Jaipur heritage lover, learning German for Goethe exam 🇩🇪 | Designer",
    profilePic: "https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram",
    nativeLanguage: "Rajasthani",
    learningLanguage: "German",
    location: "Jaipur, Rajasthan",
    isOnboarded: true,
  },
  {
    fullName: "Ananya Iyer",
    email: "ananya@example.com",
    password: "password123",
    bio: "Chennai classical dancer learning Korean for K-drama love 🇰🇷 | Artist",
    profilePic: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya",
    nativeLanguage: "Tamil",
    learningLanguage: "Korean",
    location: "Chennai, Tamil Nadu",
    isOnboarded: true,
  },
  {
    fullName: "Kabir Verma",
    email: "kabir@example.com",
    password: "password123",
    bio: "Lucknow foodie learning Italian for my chef dreams 🍕 | Cook",
    profilePic: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kabir",
    nativeLanguage: "Urdu",
    learningLanguage: "Italian",
    location: "Lucknow, Uttar Pradesh",
    isOnboarded: true,
  },
  {
    fullName: "Meera Pillai",
    email: "meera@example.com",
    password: "password123",
    bio: "Trivandrum tech lead, learning Arabic for Dubai work stint 🇦🇪",
    profilePic: "https://api.dicebear.com/7.x/avataaars/svg?seed=Meera",
    nativeLanguage: "Malayalam",
    learningLanguage: "Arabic",
    location: "Thiruvananthapuram, Kerala",
    isOnboarded: true,
  },
  {
    fullName: "Arjun Patel",
    email: "arjun@example.com",
    password: "password123",
    bio: "Ahmedabad entrepreneur learning Portuguese for Brazil trade 🇧🇷",
    profilePic: "https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun",
    nativeLanguage: "Gujarati",
    learningLanguage: "Portuguese",
    location: "Ahmedabad, Gujarat",
    isOnboarded: true,
  },
  {
    fullName: "Deepika Rao",
    email: "deepika@example.com",
    password: "password123",
    bio: "Bangalore ML engineer learning Japanese for research at Tokyo Univ 🇯🇵",
    profilePic: "https://api.dicebear.com/7.x/avataaars/svg?seed=Deepika",
    nativeLanguage: "Kannada",
    learningLanguage: "Japanese",
    location: "Bengaluru, Karnataka",
    isOnboarded: true,
  },
];

// ─── Indian-flavoured Messages ────────────────────────────────────────────────
const MESSAGE_TEMPLATES = [
  [
    "Arre yaar, finally found someone to practice with! 😄",
    "Haha bilkul! Kab shuru karein? 🙌",
  ],
  [
    "Bhai kitne time se sikh rahe ho yeh language?",
    "6 mahine se. Abhi toh shuru hua hoon 😅",
  ],
  [
    "Your profile is so cool! Bangalore se ho kya?",
    "Haan! Tum kahan se ho? 😊",
  ],
  [
    "Language exchange karte hain iss weekend?",
    "Pakka! Saturday evening theek rahega?",
  ],
  [
    "Koi acha app use karte ho practice ke liye?",
    "Main Duolingo use karta hoon mostly. Tum?",
  ],
  [
    "Yaar aaj mera exam tha aur pass ho gaya! 🎉",
    "Arrey waah! Bahut badiya! Treat toh banti hai 🥳",
  ],
  [
    "Chai peeke padhai karte ho ya coffee? ☕",
    "Chai without doubt! Ghar pe maa banati hai 😄",
  ],
  [
    "Kya tum mujhe Hindi sikhao ge? Main really interested hoon!",
    "Of course! Tum mujhe toh apni language sikhaoge na? Deal! 🤝",
  ],
];

async function seed() {
  try {
    // ── 1. Connect to MongoDB ──────────────────────────────────────────────
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected\n");

    // ── 2. Clear existing data ─────────────────────────────────────────────
    console.log("🧹 Clearing old data...");
    await User.deleteMany({});
    await FriendRequest.deleteMany({});
    await Message.deleteMany({});
    console.log("✅ Old data cleared\n");

    // ── 3. Create Users (bypassing pre-save hook to avoid double-hashing) ──
    console.log("👤 Creating Indian users...");
    const createdUsers = [];

    for (const userData of USERS) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);

      await User.collection.insertOne({
        fullName: userData.fullName,
        email: userData.email,
        password: hashedPassword,
        bio: userData.bio,
        profilePic: userData.profilePic,
        nativeLanguage: userData.nativeLanguage,
        learningLanguage: userData.learningLanguage,
        location: userData.location,
        isOnboarded: userData.isOnboarded,
        friends: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const saved = await User.findOne({ email: userData.email });
      createdUsers.push(saved);
      console.log(`  ✔ ${saved.fullName} (${saved.email}) — ${saved.location}`);
    }

    console.log(`\n✅ ${createdUsers.length} users created\n`);

    // ── 4. Create Friendships ──────────────────────────────────────────────
    console.log("🤝 Setting up friendships...");

    const friendPairs = [
      [0, 9], // Aarav ↔ Deepika  (both learning Japanese)
      [0, 1], // Aarav ↔ Priya
      [1, 7], // Priya ↔ Meera  (both Malayalam)
      [2, 8], // Rohan ↔ Arjun  (both Gujarati)
      [3, 5], // Sneha ↔ Ananya
      [4, 6], // Vikram ↔ Kabir
      [5, 9], // Ananya ↔ Deepika
      [6, 7], // Kabir ↔ Meera
      [2, 3], // Rohan ↔ Sneha
      [0, 4], // Aarav ↔ Vikram
    ];

    for (const [i, j] of friendPairs) {
      const userA = createdUsers[i];
      const userB = createdUsers[j];

      await User.findByIdAndUpdate(userA._id, {
        $addToSet: { friends: userB._id },
      });
      await User.findByIdAndUpdate(userB._id, {
        $addToSet: { friends: userA._id },
      });

      console.log(`  ✔ ${userA.fullName} ↔ ${userB.fullName}`);
    }

    console.log(`\n✅ ${friendPairs.length} friendships created\n`);

    // ── 5. Pending Friend Requests ─────────────────────────────────────────
    console.log("📨 Creating pending friend requests...");

    const pendingRequests = [
      [5, 0], // Ananya → Aarav
      [8, 1], // Arjun  → Priya
      [7, 3], // Meera  → Sneha
      [9, 6], // Deepika → Kabir
    ];

    for (const [senderIdx, recipientIdx] of pendingRequests) {
      const sender = createdUsers[senderIdx];
      const recipient = createdUsers[recipientIdx];

      await FriendRequest.create({
        sender: sender._id,
        recipient: recipient._id,
        status: "pending",
      });

      console.log(`  ✔ ${sender.fullName} → ${recipient.fullName} (pending)`);
    }

    console.log(`\n✅ ${pendingRequests.length} friend requests created\n`);

    // ── 6. Messages ────────────────────────────────────────────────────────
    console.log("💬 Creating messages...");

    let msgCount = 0;
    for (let p = 0; p < friendPairs.length; p++) {
      const [i, j] = friendPairs[p];
      const userA = createdUsers[i];
      const userB = createdUsers[j];
      const [msgA, msgB] = MESSAGE_TEMPLATES[p % MESSAGE_TEMPLATES.length];

      await Message.create({
        senderId: userA._id,
        receiverId: userB._id,
        text: msgA,
        status: "read",
      });

      await Message.create({
        senderId: userB._id,
        receiverId: userA._id,
        text: msgB,
        status: "delivered",
      });

      await Message.create({
        senderId: userA._id,
        receiverId: userB._id,
        text: "Chalo phir milte hain jaldi! 🙏",
        status: "sent",
      });

      msgCount += 3;
      console.log(`  ✔ 3 messages: ${userA.fullName} ↔ ${userB.fullName}`);
    }

    console.log(`\n✅ ${msgCount} messages created\n`);

    // ── 7. Final Summary ───────────────────────────────────────────────────
    console.log("═══════════════════════════════════════════════════════");
    console.log("🌱 SEED COMPLETE! 🇮🇳 Indian Data Loaded Successfully");
    console.log("═══════════════════════════════════════════════════════");
    console.log(`👤 Users         : ${createdUsers.length}`);
    console.log(`🤝 Friendships   : ${friendPairs.length}`);
    console.log(`📨 Requests      : ${pendingRequests.length} pending`);
    console.log(`💬 Messages      : ${msgCount}`);
    console.log("───────────────────────────────────────────────────────");
    console.log("🔑 Password for ALL users: password123");
    console.log("───────────────────────────────────────────────────────");
    console.log("\n📋 LOGIN CREDENTIALS:\n");
    for (const u of USERS) {
      console.log(`  📧 ${u.email.padEnd(30)} 👤 ${u.fullName}  📍 ${u.location}`);
    }
    console.log("");

    await mongoose.disconnect();
    console.log("🔌 Disconnected. Happy Testing! 🎉");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seed();
