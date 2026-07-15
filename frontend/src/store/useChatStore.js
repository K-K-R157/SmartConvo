import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

export const useChatStore = create((set, get) => ({
  messages: [],
  isMessagesLoading: false,
  hasMore: true, // ✅ For infinite scroll
  selectedUser: null,

  setSelectedUser: (user) => set({ selectedUser: user, messages: [], hasMore: true }),

  // ✅ Supports cursor-based pagination for infinite scroll
  getMessages: async (userId, { before } = {}) => {
    set({ isMessagesLoading: true });
    try {
      const otherUserId = get().selectedUser?._id;
      const params = { userId, otherUserId, limit: 20 };
      if (before) params.before = before;

      const res = await axiosInstance.get("/messages", { params });
      const newMessages = Array.isArray(res.data) ? res.data : [];

      set((state) => ({
        messages: before
          ? [...newMessages, ...state.messages] // Prepend older messages
          : newMessages, // Initial load
        hasMore: newMessages.length === 20, // If less than 20, no more to load
        isMessagesLoading: false,
      }));
    } catch {
      set({ messages: [], isMessagesLoading: false });
    }
  },

  addMessage: (msg) =>
    set((state) => ({ messages: [...state.messages, msg] })),

  // ✅ Mark all messages from a specific sender as "read" in the store
  markMessagesAsRead: (senderId) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.senderId === senderId && msg.status !== "read"
          ? { ...msg, status: "read" }
          : msg
      ),
    })),
}));