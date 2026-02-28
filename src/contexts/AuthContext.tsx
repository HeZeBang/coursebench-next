"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  type ReactNode,
  type Dispatch,
} from "react";
import type { UserProfile } from "@/types";
import { getPreset, setPreset, clearPreset, hasPreset } from "@/lib/cookies";

// ── State ──
interface AuthState {
  userProfile: UserProfile | null;
  isLogin: boolean;
}

// ── Actions ──
type AuthAction =
  | { type: "LOGIN"; payload: UserProfile }
  | { type: "LOGOUT" }
  | { type: "UPDATE_PROFILE"; payload: Partial<UserProfile> };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "LOGIN":
      setPreset(action.payload);
      return { userProfile: action.payload, isLogin: true };
    case "LOGOUT":
      clearPreset();
      return { userProfile: null, isLogin: false };
    case "UPDATE_PROFILE": {
      if (!state.userProfile) return state;
      const updated = { ...state.userProfile, ...action.payload };
      setPreset(updated);
      return { ...state, userProfile: updated };
    }
    default:
      return state;
  }
}

// ── Context ──
const AuthContext = createContext<AuthState>({
  userProfile: null,
  isLogin: false,
});

const AuthDispatchContext = createContext<Dispatch<AuthAction>>(() => {});

// ── Provider ──
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, {
    userProfile: null,
    isLogin: false,
  });

  // Restore from cookie on mount
  useEffect(() => {
    if (hasPreset()) {
      const preset = getPreset();
      if (preset.id) {
        dispatch({ type: "LOGIN", payload: preset as UserProfile });
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={state}>
      <AuthDispatchContext.Provider value={dispatch}>
        {children}
      </AuthDispatchContext.Provider>
    </AuthContext.Provider>
  );
}

// ── Hooks ──
export function useAuth() {
  return useContext(AuthContext);
}

export function useAuthDispatch() {
  return useContext(AuthDispatchContext);
}
