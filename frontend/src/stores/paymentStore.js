import api from "@/lib/axios";
import { toast } from "sonner";
import { create } from "zustand";

export const usePaymentStore = create((set, get) => ({
  myPayments: [],
  payments: [],
  lastOrder: null,
  loading: false,
  btnLoading: false,

  createOrder: async (bookingId) => {
    set({ btnLoading: true });
    try {
      const { data } = await api.post("/payment/order", { bookingId });
      const order = data?.data || null;
      set({ lastOrder: order });
      return order;
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create order");
      throw err;
    } finally {
      set({ btnLoading: false });
    }
  },

  verifyPayment: async ({
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  }) => {
    set({ btnLoading: true });
    try {
      const { data } = await api.post("/payment/verify", {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      });
      toast.success("Payment verified");
      await get().getMyPayments();
      return data.data;
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Payment verification failed"
      );
      throw err;
    } finally {
      set({ btnLoading: false });
    }
  },

  getMyPayments: async () => {
    set({ loading: true });
    try {
      const { data } = await api.get("/payment/me");
      set({ myPayments: data?.data || [] });
      return data.data;
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load payments");
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  generateSignatureDev: async ({ razorpay_order_id, razorpay_payment_id }) => {
    set({ btnLoading: true });
    try {
      const { data } = await api.post("/payment/signature", {
        razorpay_order_id,
        razorpay_payment_id,
      });
      return data.data;
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to generate signature"
      );
      throw err;
    } finally {
      set({ btnLoading: false });
    }
  },

  // ADMIN: list payments
  adminListPayments: async () => {
    set({ loading: true });
    try {
      const { data } = await api.get("/payment");
      set({ payments: data?.data || [] });
      return data.data;
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load payments");
      throw err;
    } finally {
      set({ loading: false });
    }
  },
}));
