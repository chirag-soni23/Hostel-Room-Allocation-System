import api from "@/lib/axios.js";
import { toast } from "sonner";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create()(
  persist(
    (set, get) => ({
      user: null,
      isAuth: false,
      loading: true,   
      btnLoading: false,

      init: async () => {
        try {
          await get().fetchMe();
        } finally {
          set({ loading: false });
        }
      },

      fetchMe: async () => {
        try {
          const { data } = await api.get("/user/me");
          set({ user: data, isAuth: true });
        } catch {
          set({ user: null, isAuth: false });
        }
      },

      register: async (payload, nav) => {
        set({ btnLoading: true });
        try {
          const { data } = await api.post("/user/register", payload);
          set({ user: data.user, isAuth: true });
          toast.success(data.message || "Registered successfully");
          await get().fetchMe();
          nav?.("/");
        } catch (err) {
          const msgArray = err?.response?.data?.errors;
          if (Array.isArray(msgArray) && msgArray.length) {
            msgArray.forEach((m) => toast.error(m));
          } else {
            toast.error(err?.response?.data?.message || "Register failed");
          }
        } finally {
          set({ btnLoading: false });
        }
      },

      login: async ({ email, password }, nav) => {
        set({ btnLoading: true });
        try {
          const { data } = await api.post("/user/login", { email, password });
          set({ user: data.user, isAuth: true });
          toast.success(data.message || "Logged in");
          await get().fetchMe();
          nav?.("/");
        } catch (err) {
          const msgArray = err?.response?.data?.errors;
          if (Array.isArray(msgArray) && msgArray.length) {
            msgArray.forEach((m) => toast.error(m));
          } else {
            toast.error(err?.response?.data?.message || "Invalid credentials");
          }
        } finally {
          set({ btnLoading: false });
        }
      },

      logout: async (nav) => {
        set({ btnLoading: true });
        try {
          const { data } = await api.get("/user/logout");
          toast.success(data?.message || "Logged out");
          set({ user: null, isAuth: false });
          nav?.("/");
        } catch (err) {
          toast.error(err?.response?.data?.message || "Logout failed");
        } finally {
          set({ btnLoading: false });
        }
      },

      updateProfile: async (updates) => {
        set({ btnLoading: true });
        try {
          const { data } = await api.patch("/user/update", updates);
          set({ user: data.user });
          toast.success(data.message || "Profile updated");
        } catch (err) {
          const msgs = err?.response?.data?.errors;
          if (Array.isArray(msgs) && msgs.length) {
            msgs.forEach((m) => toast.error(m));
          } else {
            toast.error(err?.response?.data?.message || "Update failed");
          }
        } finally {
          set({ btnLoading: false });
        }
      },

      changePassword: async ({ oldPassword, newPassword, confirmNewPassword }) => {
        set({ btnLoading: true });
        try {
          const { data } = await api.patch("/user/update-password", {
            oldPassword,
            newPassword,
            confirmNewPassword,
          });
          toast.success(data?.message || "Password changed successfully");
        } catch (err) {
          const msgs = err?.response?.data?.errors;
          if (Array.isArray(msgs) && msgs.length) {
            msgs.forEach((m) => toast.error(m));
          } else {
            toast.error(err?.response?.data?.message || "Password change failed");
          }
          throw err;
        } finally {
          set({ btnLoading: false });
        }
      },
    }),
    {
      name: "auth-store",
      partialize: (s) => ({ user: s.user, isAuth: s.isAuth }),
    }
  )
);
