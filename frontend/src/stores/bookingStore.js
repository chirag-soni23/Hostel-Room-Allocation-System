import { create } from 'zustand';

const initialDraft = {
  room: null,
  checkInDate: '',
  months: 1,
  totalAmount: 0,
};

export const useBookingStore = create((set, get) => ({
  draft: initialDraft,
  currentBooking: null,

  setDraft: (updates) =>
    set((state) => {
      const newDraft = { ...state.draft, ...updates };
      if (newDraft.room && newDraft.months) {
        newDraft.totalAmount = newDraft.room.pricePerMonth * newDraft.months;
      }
      return { draft: newDraft };
    }),

  setRoom: (room) =>
    set((state) => ({
      draft: {
        ...state.draft,
        room,
        totalAmount: room.pricePerMonth * state.draft.months,
      },
    })),

  setCurrentBooking: (booking) => set({ currentBooking: booking }),

  clearDraft: () => set({ draft: initialDraft }),

  calculateTotal: () => {
    const { draft } = get();
    if (draft.room && draft.months) {
      set({
        draft: {
          ...draft,
          totalAmount: draft.room.pricePerMonth * draft.months,
        },
      });
    }
  },
}));
