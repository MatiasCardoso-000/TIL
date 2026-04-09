import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeProvider";

interface AuthLayoutProps {
  title: string;
  children: ReactNode;
  footerText: string;
  footerLinkText: string;
  footerLinkTo: string;
  variant?: "login" | "register";
}

interface EyeIconProps {
  open: boolean;
}

export function EyeIcon({ open }: EyeIconProps) {
  if (open) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="15"
        height="15"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21"
        />
      </svg>
    );
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="15"
      height="15"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  );
}

function AuthLayout({
  title,
  children,
  footerText,
  footerLinkText,
  footerLinkTo,
  variant = "register",
}: AuthLayoutProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      <div
        className={`auth-bg auth-layout-${variant}`}
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}
      >
        {/* Theme toggle button */}
        <button
          className="auth-theme-btn"
          onClick={toggleTheme}
          aria-label={`Cambiar a modo ${theme === "dark" ? "claro" : "oscuro"}`}
          title={`Modo ${theme === "dark" ? "claro" : "oscuro"}`}
        >
          {theme === "dark" ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          )}
        </button>

        <div style={{ width: "100%", maxWidth: "340px" }}>
          <div className="fade-1" style={{ marginBottom: "36px" }}>
            <div className="auth-volume">vol. i — {new Date().getFullYear()}</div>
            <h1 className="auth-title">TIL</h1>
            <p className="auth-subtitle">{title}</p>
          </div>

          <div className="auth-divider" />

          {children}

          <div className="auth-footer-divider" />
          <p className="auth-footer">
            {footerText}{" "}
            <Link to={footerLinkTo} className="auth-link">
              {footerLinkText}
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}

export default AuthLayout;
