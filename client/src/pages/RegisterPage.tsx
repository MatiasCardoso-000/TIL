import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "../lib/api";
import { useAuth } from "../hooks/useAuth";
import AuthLayout, { EyeIcon } from "../components/AuthLayout";
import type { User } from "../types/types";
import Form from "../components/Form";
import ErrorMessage from "../components/ErrorMessage";

interface RegisterResponse {
  user: User;
  accessToken: string;
}

type ErrorType = Error & {
  data?: unknown;
};

function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    password?: string[];
    confirmPassword?: string[];
    username?: string[];
    _general?: string[];
  }>({});
  const mutation = useMutation({
    mutationFn: () =>
      apiFetch<RegisterResponse>("/register", {
        method: "POST",
        body: JSON.stringify({ username, email, password, confirmPassword }),
      }),
    onSuccess: ({ user, accessToken }) => {
      login(user, accessToken);
      navigate("/");
      setFieldErrors({});
    },
    onError: (err: ErrorType) => {
      setFieldErrors(
        (err.data as { errors?: Record<string, string[]> })?.errors ?? {},
      );
    },
  });

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  return (
    <AuthLayout
      variant="register"
      title="Creá tu cuenta"
      footerText="Ya tenés cuenta?"
      footerLinkText="Iniciá sesión"
      footerLinkTo="/login"
    >
      <Form handleSubmit={handleSubmit}>
        <div className="fade-3" style={{ marginBottom: "24px" }}>
          <label className="til-label">Usuario</label>
          <input
            className="til-input-bare"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder="tu_usuario"
          />
        </div>

        <div className="fade-4" style={{ marginBottom: "24px" }}>
          <label className="til-label">Email</label>
          <input
            className="til-input-bare"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="tu@email.com"
          />
        </div>

        <div className="fade-5" style={{ marginBottom: "24px" }}>
          <label className="til-label">Contraseña</label>
          <div style={{ position: "relative" }}>
            <input
              className="til-input"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="til-password-btn"
              aria-label={
                showPassword ? "Ocultar contraseña" : "Ver contraseña"
              }
            >
              <EyeIcon open={showPassword} />
            </button>
          </div>
          <p
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: "10px",
              color: "#9090a8",
              marginTop: "6px",
            }}
          >
            Mín. 8 chars, mayúscula, número y símbolo.
          </p>
        </div>

        <div className="fade-6" style={{ marginBottom: "32px" }}>
          <label className="til-label">Confirmar contraseña</label>
          <div style={{ position: "relative" }}>
            <input
              className="til-input"
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="til-password-btn"
              aria-label={showConfirm ? "Ocultar contraseña" : "Ver contraseña"}
            >
              <EyeIcon open={showConfirm} />
            </button>
          </div>
        </div>

        {mutation.isError && (
          <ErrorMessage fieldErrors={fieldErrors} variant="register" />
        )}

        <div className="fade-7">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="til-btn"
          >
            {mutation.isPending ? "Creando cuenta..." : "Crear cuenta →"}
          </button>
        </div>
      </Form>
    </AuthLayout>
  );
}

export default RegisterPage;
