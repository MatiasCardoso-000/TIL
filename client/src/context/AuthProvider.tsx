import { useEffect, useRef, useState } from "react";
import { AuthContext,  } from "./AuthContext";
import { apiFetch } from "../lib/api";
import type { AuthState, User } from "../types/types";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    accessToken: null,
  });
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const initialized = useRef(false);

  const login = (user: User, accessToken: string) => {
    setAuth({ user, accessToken });
  };

  const logout = () => {
    setAuth({ user: null, accessToken: null });
  };

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const controller = new AbortController();

    const checkLogin = async () => {
      try {
        const token = await apiFetch<{ accessToken: string }>(
          `/refresh-token`,
          {
            method: "POST",
          },
        );

        const user = await apiFetch<User>(`/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token.accessToken}`,
          },
        });

        setAuth({ user, accessToken: token.accessToken });
      } catch (error: any ) {
        if (error.name === "AbortError") return;
      } finally {
        setIsInitializing(false);
      }
    };
    checkLogin();

    return () => {
      controller.abort();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ ...auth, login, logout, isInitializing }}>
      {children}
    </AuthContext.Provider>
  );
}
