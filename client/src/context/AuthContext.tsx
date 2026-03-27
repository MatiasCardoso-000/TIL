import { createContext} from "react";

export interface User {
  id: string;
  username: string;
  email: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
}

export interface AuthContextType extends AuthState {
  login: (user: User, accessToken: string) => void;
  logout: () => void;
  isInitializing: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);
