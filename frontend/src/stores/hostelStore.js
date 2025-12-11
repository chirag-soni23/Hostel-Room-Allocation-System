import api from "@/lib/axios.js";
import { toast } from "sonner";
import { create } from "zustand";

export const useHostelStore = create((set, get) => ({
  hostels: [],
  hostel: null,
  loading: true,
  btnLoading: false,
  total: 0,

  init: async () => {
    try {
      await get().fetchHostels();
    } finally {
      set({ loading: false });
    }
  },


  fetchHostels: async (filters = {}) => {
    set({ loading: true });
    try {
      const params = new URLSearchParams();

      if (filters.q) params.append("q", filters.q);
      if (filters.city) params.append("city", filters.city);
      if (filters.amenities)
        params.append(
          "amenities",
          Array.isArray(filters.amenities)
            ? filters.amenities.join(",")
            : filters.amenities
        );
      if (filters.page) params.append("page", filters.page);
      if (filters.limit) params.append("limit", filters.limit);

      const query = params.toString() ? `?${params.toString()}` : "";
      const { data } = await api.get(`/hostel${query}`);

      const response = data.data;
      const hostels = Array.isArray(response)
        ? response
        : response?.items || [];

      set({
        hostels,
        total: response?.total || hostels.length,
      });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to fetch hostels");
    } finally {
      set({ loading: false });
    }
  },

  fetchHostelById: async (id) => {
    set({ loading: true });
    try {
      const { data } = await api.get(`/hostel/${id}`);
      set({ hostel: data.data || null });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to fetch hostel");
    } finally {
      set({ loading: false });
    }
  },

  createHostel: async (payload) => {
    set({ btnLoading: true });
    try {
      const form = new FormData();
      if (payload.name) form.append("name", payload.name);
      if (payload.location) form.append("location", payload.location);
      if (payload.amenities)
        form.append(
          "amenities",
          Array.isArray(payload.amenities)
            ? payload.amenities.join(",")
            : payload.amenities
        );
      if (payload.rules)
        form.append(
          "rules",
          Array.isArray(payload.rules)
            ? payload.rules.join(",")
            : payload.rules
        );
      if (payload.photoFile) form.append("photo", payload.photoFile);

      const { data } = await api.post("/hostel", form);
      toast.success(data.message || "Hostel created");
      await get().fetchHostels();
      return data.data;
    } catch (err) {
      const msgs = err?.response?.data?.errors;
      if (Array.isArray(msgs) && msgs.length) {
        msgs.forEach((m) => toast.error(m));
      } else {
        toast.error(err?.response?.data?.message || "Create hostel failed");
      }
      throw err;
    } finally {
      set({ btnLoading: false });
    }
  },

  updateHostel: async (id, payload) => {
    set({ btnLoading: true });
    try {
      const form = new FormData();
      if (payload.name !== undefined) form.append("name", payload.name);
      if (payload.location !== undefined)
        form.append("location", payload.location);
      if (payload.amenities !== undefined)
        form.append(
          "amenities",
          Array.isArray(payload.amenities)
            ? payload.amenities.join(",")
            : payload.amenities
        );
      if (payload.rules !== undefined)
        form.append(
          "rules",
          Array.isArray(payload.rules)
            ? payload.rules.join(",")
            : payload.rules
        );
      if (payload.photoFile) form.append("photo", payload.photoFile);

      const { data } = await api.put(`/hostel/${id}`, form);
      toast.success(data.message || "Hostel updated");
      await get().fetchHostels();
      if (get().hostel?._id === id) {
        set({ hostel: data.data });
      }
      return data.data;
    } catch (err) {
      const msgs = err?.response?.data?.errors;
      if (Array.isArray(msgs) && msgs.length) {
        msgs.forEach((m) => toast.error(m));
      } else {
        toast.error(err?.response?.data?.message || "Update failed");
      }
      throw err;
    } finally {
      set({ btnLoading: false });
    }
  },

  deleteHostel: async (id) => {
    set({ btnLoading: true });
    try {
      const { data } = await api.delete(`/hostel/${id}`);
      toast.success(data.message || "Hostel deleted");
      await get().fetchHostels();
      if (get().hostel?._id === id) set({ hostel: null });
      return true;
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete failed");
      throw err;
    } finally {
      set({ btnLoading: false });
    }
  },

  clearHostel: () => set({ hostel: null }),
}));
