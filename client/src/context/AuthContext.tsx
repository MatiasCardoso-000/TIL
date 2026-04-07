import { createContext } from "react";
import type { AuthState, User } from "../types/types";
export interface AuthContextType extends AuthState {
  login: (user: User, accessToken: string) => void;
  logout: () => void;
  isInitializing: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);
