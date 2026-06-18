import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

export const useChatStore = create((set, get) => ({
  messages: [],
  isMessagesLoading: false,
  selectedUser: null,

  setSelectedUser: (user) => set({ selectedUser: user, messages: [] }),

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages`, {
        params: { userId, otherUserId: get().selectedUser?._id, limit: 20 },
      });
      set({ messages: Array.isArray(res.data) ? res.data : [] });
    } catch {
      set({ messages: [] });
    }
    set({ isMessagesLoading: false });
  },

  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
}));


// import { create } from "zustand";
// import { axiosInstance } from "../lib/axios";

// export const useChatStore = create((set, get) => ({
//   messages: [],
//   isMessagesLoading: false,
//   hasMore: true,
//   selectedUser: null,

//   setSelectedUser: (user) => set({ selectedUser: user, messages: [] }),

//   getMessages: async (userId, { before } = {}) => {
//     set({ isMessagesLoading: true });
//     const otherUserId = get().selectedUser?._id;
//     const params = { userId, otherUserId, limit: 20 };
//     if (before) params.before = before;
//     const res = await axiosInstance.get("/messages", { params });
//     const newMessages = res.data;
//     set((state) => ({
//       messages: before
//       ? [...newMessages, ...state.messages]
//         : newMessages,
//       hasMore: newMessages.length === 20,
//       isMessagesLoading: false,
//     }));
//   },

//   addMessage: (msg) =>
//     set((state) => ({ messages: [...state.messages, msg] })),
// }));