import { useAuth } from "../hooks/useAuth";
import { apiFetch } from "../lib/api";

export default function Header() {
  const { user, logout } = useAuth();

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
          <span
            style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: "24px",
              color: "#f0ece4",
              lineHeight: 1,
            }}
          >
            TIL
          </span>
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: "9px",
              color: "#9090a8",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            Today I Learned
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: "11px",
              color: "#9090a8",
            }}
          >
            @{user?.username}
          </span>
          <button className="til-logout" onClick={handleLogout}>
            Salir
          </button>
        </div>
      </div>
    </header>
  );
}
