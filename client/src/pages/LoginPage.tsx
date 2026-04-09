import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "../lib/api";
import { useAuth } from "../hooks/useAuth";
import AuthLayout, { EyeIcon } from "../components/AuthLayout";
import type { User } from "../types/types";
import ErrorMessage from "../components/ErrorMessage";

interface LoginResponse {
  user: User;
  accessToken: string;
}

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const mutation = useMutation({
    mutationFn: () =>
      apiFetch<LoginResponse>("/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),
    onSuccess: ({ user, accessToken }) => {
      login(user, accessToken);
      navigate("/");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  return (
    <AuthLayout
      variant="login"
      title="Today I Learned"
      footerText="No tenés cuenta?"
      footerLinkText="Registrate"
      footerLinkTo="/register"
    >
      <form onSubmit={handleSubmit}>
        <div className="fade-3" style={{ marginBottom: "24px" }}>
          <label className="auth-label">Email</label>
          <input
            className="auth-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="tu@email.com"
          />
        </div>

        <div className="fade-4" style={{ marginBottom: "32px" }}>
          <label className="auth-label">Contraseña</label>
          <div style={{ position: "relative" }}>
            <input
              className="auth-input auth-input--password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="auth-password-btn"
              aria-label={
                showPassword ? "Ocultar contraseña" : "Ver contraseña"
              }
            >
              <EyeIcon open={showPassword} />
            </button>
          </div>
        </div>

        {mutation.isError && (
          <ErrorMessage message={mutation.error.message} variant="login" />
        )}
        <div className="fade-5">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="auth-btn"
          >
            {mutation.isPending ? "Iniciando sesión..." : "Iniciar sesión →"}
          </button>
        </div>
      </form>
    </AuthLayout>
  );
}

export default LoginPage;
