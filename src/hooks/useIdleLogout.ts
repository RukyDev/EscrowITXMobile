import { useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useAuthStore } from '../store/auth.store';

const IDLE_TIMEOUT_MS = 5 * 60 * 1000;
const CHECK_INTERVAL_MS = 15 * 1000;

/**
 * Logs the user out after IDLE_TIMEOUT_MS of no interaction with the app,
 * including time spent backgrounded (checked immediately on foreground resume,
 * since JS timers are throttled while the app is backgrounded).
 */
export function useIdleLogout() {
    const lastActiveRef = useRef(Date.now());
    const appStateRef = useRef<AppStateStatus>(AppState.currentState);
    const user = useAuthStore(s => s.user);
    const logout = useAuthStore(s => s.logout);

    const recordActivity = useCallback(() => {
        lastActiveRef.current = Date.now();
    }, []);

    useEffect(() => {
        if (!user) {
            return;
        }

        recordActivity();

        const interval = setInterval(() => {
            if (Date.now() - lastActiveRef.current > IDLE_TIMEOUT_MS) {
                logout();
            }
        }, CHECK_INTERVAL_MS);

        const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
            const wasBackgrounded = appStateRef.current.match(/inactive|background/);
            const isNowActive = nextState === 'active';

            if (wasBackgrounded && isNowActive) {
                if (Date.now() - lastActiveRef.current > IDLE_TIMEOUT_MS) {
                    logout();
                } else {
                    recordActivity();
                }
            }
            appStateRef.current = nextState;
        });

        return () => {
            clearInterval(interval);
            subscription.remove();
        };
    }, [user, logout, recordActivity]);

    return recordActivity;
}
