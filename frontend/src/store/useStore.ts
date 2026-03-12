import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserState {
  isLoggedIn: boolean;
  mobileNumber: string;
  ucc: string;
  setLoginDetails: (consumerKey: string, mobileNumber: string, ucc: string) => void;
  setLoggedIn: (status: boolean) => void;
  logout: () => void;
}

export interface MarketDataState {
  prices: Record<string, { ltp: number, open: number, high: number, low: number, close: number }>;
  updatePrice: (token: string, data: any) => void;
}

interface StoreState extends UserState, MarketDataState {}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      // Auth state
      isLoggedIn: false,
      mobileNumber: '',
      ucc: '',
      setLoginDetails: (consumerKey, mobileNumber, ucc) => set({ mobileNumber, ucc }),
      setLoggedIn: (status) => set({ isLoggedIn: status }),
      logout: () => set({ isLoggedIn: false, mobileNumber: '', ucc: '', prices: {} }),

      // Market Data state
      prices: {},
      updatePrice: (token, data) => set((state) => ({
        prices: {
          ...state.prices,
          [token]: {
            ...state.prices[token],
            ...data
          }
        }
      }))
    }),
    {
      name: 'kotak-trader-storage', // name of item in the storage (must be unique)
      partialize: (state) => ({ isLoggedIn: state.isLoggedIn, mobileNumber: state.mobileNumber, ucc: state.ucc }),
    }
  )
);
