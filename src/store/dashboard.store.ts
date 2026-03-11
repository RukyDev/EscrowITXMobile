import { create } from 'zustand';
import { getDashboard } from '../core/api/dashboard.api';
import { DashboardResponse } from '../core/types/dashboard.types';

interface DashboardState {
  dashboard: DashboardResponse | null;
  isLoading: boolean;
  fetchDashboard: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  dashboard: null,
  isLoading: false,

  fetchDashboard: async () => {
    try {
      set({ isLoading: true });
      const response = await getDashboard();
      set({
        dashboard: response,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
    }
  },
}));