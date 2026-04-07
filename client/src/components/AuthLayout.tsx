import type { ReactNode } from "react";
import { Link } from "react-router-dom";

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
  return (
    <>
      <div
        className={`til-bg auth-layout-${variant}`}
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}
      >
        <div style={{ width: "100%", maxWidth: "340px" }}>
          <div className="fade-1" style={{ marginBottom: "36px" }}>
            <div
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: "10px",
                color: "#9090a8",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                marginBottom: "10px",
              }}
            >
              vol. i — {new Date().getFullYear()}
            </div>
            <h1
              style={{
                fontFamily: "'Instrument Serif', serif",
                fontSize: "52px",
                color: "#f0ece4",
                lineHeight: 1,
                margin: 0,
              }}
            >
              TIL
            </h1>
            <p
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: "10px",
                color: "#9090a8",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginTop: "6px",
              }}
            >
              {title}
            </p>
          </div>

          <div
            className="fade-2"
            style={{
              height: "1px",
              background: "linear-gradient(to right, #e8c547 0%, #2a2a3a 60%)",
              marginBottom: "32px",
            }}
          />

          {children}

          <div
            style={{
              height: "1px",
              background: "#16161f",
              margin: "28px 0 20px",
            }}
          />
          <p
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: "11px",
              color: "#9090a8",
              textAlign: "center",
            }}
          >
            {footerText}{" "}
            <Link
              to={footerLinkTo}
              style={{ color: "#e8c547", textDecoration: "none" }}
            >
              {footerLinkText}
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}

export default AuthLayout;
