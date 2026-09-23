import { create } from 'zustand';
import { tokenService } from '../core/storage/token.service';
import { authApi, SessionUser, KYCStatus } from '../core/api/auth.api';

interface AuthState {
  user: SessionUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  // Only true while the initial session check (bootstrap) is running. Kept separate from
  // isLoading (which also covers the login/register button spinners) because RootNavigator
  // unmounts its whole navigation tree while this is true — doing that on every login
  // attempt would silently discard any in-flight navigation.navigate() call and reset
  // screen state, since isLoading toggles on every login attempt too.
  isBootstrapping: boolean;
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
  isBootstrapping: true,

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
        // session is now the result.payload (if it exists) or result due to axios interceptor
        userData = session?.userDetails || session?.user || session;
        const rawKycStatus = (session?.userDetails?.kycStatus ?? session?.kycStatus ?? userData?.kycStatus);
        
        if (userData) {
          userData.kycStatus = rawKycStatus !== undefined ? Number(rawKycStatus) : KYCStatus.Unverified;
        }
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
    set({ isBootstrapping: true });

    try {
      const token = await tokenService.get();

      if (!token) {
        set({ isBootstrapping: false });
        return;
      }

      const session: any = await authApi.getSession();

      let userData = null;
      try {
        // session is now the result.payload (if it exists) or result due to axios interceptor
        userData = session?.userDetails || session?.user || session;
        const rawKycStatus = (session?.userDetails?.kycStatus ?? session?.kycStatus ?? userData?.kycStatus);

        if (userData) {
          userData.kycStatus = rawKycStatus !== undefined ? Number(rawKycStatus) : KYCStatus.Unverified;
        }
      } catch (e) { }

      set({
        user: userData,
        accessToken: token,
        isAuthenticated: true,
        isBootstrapping: false,
      });

    } catch (error) {
      await tokenService.clear();
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isBootstrapping: false,
      });
    }
  },
}));