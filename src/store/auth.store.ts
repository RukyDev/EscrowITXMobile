import { create } from 'zustand';
import { tokenService } from '../core/storage/token.service';
import { authApi, SessionUser } from '../core/api/auth.api';

interface AuthState {
  user: SessionUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  bootstrap: () => Promise<void>;
  setUser: (user: SessionUser | null) => void;
  setTokens: (accessToken: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,

  setUser: (user) => set({ user }),
  setTokens: (accessToken) => set({ accessToken, isAuthenticated: !!accessToken }),

  login: async (email, password) => {
    set({ isLoading: true });

    try {
      const loginResult = await authApi.login({
        userNameOrEmailAddress: email,
        password,
        rememberClient: true,
      });

      await tokenService.save(loginResult.accessToken);

      const session: any = await authApi.getSession();

      let userData = null;
      try {
        userData = session?.userDetails || session?.user || session?.result?.user || session?.data?.result?.user || session?.result || session;
        if (userData && userData.result) userData = userData.result;
        if (userData && userData.user) userData = userData.user;
      } catch (e) { }

      set({
        user: userData,
        accessToken: loginResult.accessToken,
        isAuthenticated: true,
      });
    } catch (error: any) {
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    await tokenService.clear();
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
    });
  },

  bootstrap: async () => {
    set({ isLoading: true });

    try {
      const token = await tokenService.get();

      if (!token) {
        set({ isLoading: false });
        return;
      }

      const session: any = await authApi.getSession();

      let userData = null;
      try {
        userData = session?.userDetails || session?.user || session?.result?.user || session?.data?.result?.user || session?.result || session;
        if (userData && userData.result) userData = userData.result;
        if (userData && userData.user) userData = userData.user;
      } catch (e) { }

      set({
        user: userData,
        accessToken: token,
        isAuthenticated: true,
        isLoading: false,
      });

    } catch (error) {
      await tokenService.clear();
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },
}));