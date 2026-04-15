import { useAuth } from "../hooks/useAuth";
import { apiFetch } from "../lib/api";
import { useTheme } from "../context/ThemeProvider";
import { Link  } from "react-router-dom";

export default function Header() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();


  const handleLogout = async () => {
    await apiFetch("/logout", { method: "POST" }).catch(() => {});
    logout();
  };

  return (
    <header className="til-header">
      <div
        style={{
          maxWidth: "600px",
          margin: "0 auto",
          padding: "0 24px",
          height: "52px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
          <Link to="/">
            <span className="header-logo">TIL</span>
            <span className="header-subtitle">Today I Learned</span>
          </Link>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button
            className="header-theme-btn"
            onClick={toggleTheme}
            aria-label={`Cambiar a modo ${theme === "dark" ? "claro" : "oscuro"}`}
            title={`Modo ${theme === "dark" ? "claro" : "oscuro"}`}
          >
            {theme === "dark" ? (
              // Sun icon (switch to light)
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
              // Moon icon (switch to dark)
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
          <Link to={`/profile/${user?.id}`}>
            <span className="header-username">@{user?.username}</span>
          </Link>

          <button className="til-logout" onClick={handleLogout}>
            Salir
          </button>
        </div>
      </div>
    </header>
  );
}
