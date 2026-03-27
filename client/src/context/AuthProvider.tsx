import { useEffect, useState } from "react";
import { AuthContext, type AuthState, type User } from "./AuthContext";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    accessToken: null,
  });
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  const login = (user: User, accessToken: string) => {
    setAuth({ user, accessToken });
  };

  const logout = () => {
    setAuth({ user: null, accessToken: null });
  };

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const checkLogin = async () => {
      try {
        const tokenResponse = await fetch(
          "/api/refresh-token",
          {
            signal,
            method: "POST",
            credentials: "include",
          },
        );
        const token = await tokenResponse.json();

        if (!tokenResponse.ok) {
          console.warn("[AuthProvider] No active session");
          return;
        }

        const userResponse = await fetch("/api/me", {
          signal,
          method: "GET",
          credentials: "include",
          headers: {
            Authorization: `Bearer ${token.accessToken}`,
          },
        });

        const user = await userResponse.json();
        setAuth({ user, accessToken: token.accessToken });
      } catch (error: any) {
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
