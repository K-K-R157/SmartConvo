import { create } from "zustand";

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem("smartconvo-theme") || "coffee",
  setTheme: (theme) => {
    localStorage.setItem("smartconvo-theme", theme);
    set({ theme });
  },
}));