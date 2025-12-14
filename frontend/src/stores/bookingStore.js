import api from "@/lib/axios";
import { toast } from "sonner";
import { create } from "zustand";

export const useBookingStore = create((set, get) => ({
  draft: { room: null, checkInDate: "", months: 1, totalAmount: 0 },
  booking: null,
  bookings: [],
  adminBookings: [],
  total: 0,
  adminTotal: 0,
  loading: false,
  btnLoading: false,

  setRoom: (room) => set((s) => ({ draft: { ...s.draft, room } })),
  setDraft: (payload) => set((s) => ({ draft: { ...s.draft, ...payload } })),
  clearDraft: () =>
    set({
      draft: { room: null, checkInDate: "", months: 1, totalAmount: 0 },
    }),

  // Create a booking
  createBooking: async ({ roomId, hostelId, checkInDate, durationMonths }) => {
    set({ btnLoading: true });
    try {
      const payload = {
        roomId,
        hostelId,
        checkInDate,
        durationMonths: Number(durationMonths),
      };
      const { data } = await api.post("/booking", payload);
      const created = data?.data;
      if (created) set({ booking: created });
      toast.success("Booking created");
      return created;
    } catch (err) {
      const errors = err?.response?.data?.errors;
      if (Array.isArray(errors)) errors.forEach((e) => toast.error(e));
      else
        toast.error(err?.response?.data?.message || "Failed to create booking");
      throw err;
    } finally {
      set({ btnLoading: false });
    }
  },

  // List my bookings
  getMyBookings: async ({
    status,
    page = 1,
    limit = 12,
    sort = "createdAt:desc",
  } = {}) => {
    set({ loading: true });
    try {
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      params.set("page", String(page));
      params.set("limit", String(limit));
      params.set("sort", String(sort));

      const { data } = await api.get(`/booking/me?${params.toString()}`);
      const resp = data?.data || {};
      set({
        bookings: Array.isArray(resp.items) ? resp.items : [],
        total: Number(resp.total || 0),
      });
      return resp;
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load bookings");
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  // Get one booking (mine or admin allowed)
  getBookingById: async (id) => {
    set({ loading: true });
    try {
      const { data } = await api.get(`/booking/${id}`);
      const doc = data?.data || null;
      set({ booking: doc });
      return doc;
    } catch (err) {
      toast.error(err?.response?.data?.message || "Booking not found");
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  // Cancel my booking
  cancelMyBooking: async (bookingId) => {
    set({ btnLoading: true });
    try {
      const { data } = await api.patch(`/booking/${bookingId}/cancel`);
      toast.success(data?.message || "Booking cancelled");
      await get().getMyBookings();
      return data?.data;
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to cancel booking");
      throw err;
    } finally {
      set({ btnLoading: false });
    }
  },

  adminListBookings: async ({
    userId,
    hostelId,
    roomId,
    status,
    q,
    page = 1,
    limit = 20,
    sort = "createdAt:desc",
  } = {}) => {
    set({ loading: true });
    try {
      const params = new URLSearchParams();
      if (userId) params.set("userId", userId);
      if (hostelId) params.set("hostelId", hostelId);
      if (roomId) params.set("roomId", roomId);
      if (status) params.set("status", status);
      if (q) params.set("q", q);
      params.set("page", String(page));
      params.set("limit", String(limit));
      params.set("sort", String(sort));

      const { data } = await api.get(`/booking?${params.toString()}`);
      const resp = data?.data || {};
      set({
        adminBookings: Array.isArray(resp.items) ? resp.items : [],
        adminTotal: Number(resp.total || 0),
      });
      return resp;
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load bookings");
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  adminUpdateStatus: async (id, status) => {
    set({ btnLoading: true });
    try {
      const { data } = await api.patch(`/booking/${id}/status`, { status });
      toast.success("Status updated");
      await get().adminListBookings();
      return data?.data;
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update status");
      throw err;
    } finally {
      set({ btnLoading: false });
    }
  },

  adminDeleteBooking: async (id) => {
    set({ btnLoading: true });
    try {
      const { data } = await api.delete(`/booking/${id}`);
      toast.success(data?.message || "Booking deleted");
      await get().adminListBookings();
      return true;
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete booking");
      throw err;
    } finally {
      set({ btnLoading: false });
    }
  },
}));
