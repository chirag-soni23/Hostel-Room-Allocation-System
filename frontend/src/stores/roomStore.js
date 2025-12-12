import api from "@/lib/axios";
import { toast } from "sonner";
import { create } from "zustand";

export const useRoomStore = create((set, get) => ({
  rooms: [],
  room: null,
  loading: false,
  btnLoading: false,
  total: 0, 

  fetchRooms: async ({
    q,
    type,
    gender,
    hostelId,
    minRent,
    maxRent,
    available,
    page = 1,
    limit = 6,
  } = {}) => {
    set({ loading: true });
    try {
      const params = new URLSearchParams();
      if (q) params.append("q", q);
      if (type) params.append("type", type);
      if (gender) params.append("gender", gender);
      if (hostelId) params.append("hostelId", hostelId);
      if (minRent !== undefined) params.append("minRent", minRent);
      if (maxRent !== undefined) params.append("maxRent", maxRent);
      if (available !== undefined) params.append("available", available);
      params.append("page", page);
      params.append("limit", limit);

      const { data } = await api.get(`/room?${params.toString()}`);
      const response = data.data;

      set({
        rooms: Array.isArray(response.items) ? response.items : response || [],
        total: response?.total || 0,
      });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load rooms");
    } finally {
      set({ loading: false });
    }
  },

  fetchRoomById: async (id) => {
    set({ loading: true });
    try {
      const { data } = await api.get(`/room/${id}`);
      set({ room: data.data || null });
    } catch (err) {
      toast.error("Room not found");
    } finally {
      set({ loading: false });
    }
  },

  createRoom: async (formData) => {
    set({ btnLoading: true });
    try {
      const { data } = await api.post("/room", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(data.message || "Room created");
      await get().fetchRooms(); // refetch rooms after creation
      return data.data;
    } catch (err) {
      const errors = err?.response?.data?.errors;
      if (Array.isArray(errors)) errors.forEach(e => toast.error(e));
      else toast.error(err?.response?.data?.message || "Failed to create room");
      throw err;
    } finally {
      set({ btnLoading: false });
    }
  },

  updateRoom: async (id, formData) => {
    set({ btnLoading: true });
    try {
      const { data } = await api.patch(`/room/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(data.message || "Room updated");
      await get().fetchRoomById(id);
      return data.data;
    } catch (err) {
      const errors = err?.response?.data?.errors;
      if (Array.isArray(errors)) errors.forEach(e => toast.error(e));
      else toast.error(err?.response?.data?.message || "Failed to update room");
      throw err;
    } finally {
      set({ btnLoading: false });
    }
  },

  deleteRoom: async (id) => {
    set({ btnLoading: true });
    try {
      const { data } = await api.delete(`/room/${id}`);
      toast.success(data.message || "Room deleted");
      await get().fetchRooms(); // refetch rooms after deletion
      if (get().room?._id === id) set({ room: null });
      return true;
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete room");
      throw err;
    } finally {
      set({ btnLoading: false });
    }
  },
}));

