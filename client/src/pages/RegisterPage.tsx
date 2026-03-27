import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { apiFetch } from '../lib/api'
import { useAuth } from '../hooks/useAuth'

interface RegisterResponse {
  user: { id: string; username: string; email: string }
  accessToken: string
}

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
      </svg>
    )
  }
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  )
}

function RegisterPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    const link = document.createElement('link')
    link.href =
      'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Instrument+Serif:ital@0;1&display=swap'
    link.rel = 'stylesheet'
    document.head.appendChild(link)
    return () => { document.head.removeChild(link) }
  }, [])

  const mutation = useMutation({
    mutationFn: () =>
      apiFetch<RegisterResponse>('/register', {
        method: 'POST',
        body: JSON.stringify({ username, email, password, confirmPassword }),
      }),
    onSuccess: ({ user, accessToken }) => {
      login(user, accessToken)
      navigate('/')
    },
  })

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault()
    mutation.mutate()
  }

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .til-bg {
          background-color: #0b0b0f;
          background-image: radial-gradient(circle at 1px 1px, #16161f 1px, transparent 0);
          background-size: 28px 28px;
        }
        .til-input {
          background: transparent;
          border: none;
          border-bottom: 1px solid #22222e;
          border-radius: 0;
          color: #f0ece4;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 13px;
          padding: 10px 32px 10px 0;
          width: 100%;
          outline: none;
          transition: border-color 0.2s;
        }
        .til-input::placeholder { color: #32323f; }
        .til-input:focus { border-bottom-color: #e8c547; }
        .til-input-bare {
          background: transparent;
          border: none;
          border-bottom: 1px solid #22222e;
          border-radius: 0;
          color: #f0ece4;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 13px;
          padding: 10px 0;
          width: 100%;
          outline: none;
          transition: border-color 0.2s;
        }
        .til-input-bare::placeholder { color: #32323f; }
        .til-input-bare:focus { border-bottom-color: #e8c547; }
        .fade-1 { animation: fadeUp 0.5s ease 0.0s forwards; opacity: 0; }
        .fade-2 { animation: fadeUp 0.5s ease 0.07s forwards; opacity: 0; }
        .fade-3 { animation: fadeUp 0.5s ease 0.14s forwards; opacity: 0; }
        .fade-4 { animation: fadeUp 0.5s ease 0.21s forwards; opacity: 0; }
        .fade-5 { animation: fadeUp 0.5s ease 0.28s forwards; opacity: 0; }
        .fade-6 { animation: fadeUp 0.5s ease 0.35s forwards; opacity: 0; }
        .fade-7 { animation: fadeUp 0.5s ease 0.42s forwards; opacity: 0; }
        .til-btn {
          width: 100%;
          background: #e8c547;
          color: #0b0b0f;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          padding: 15px;
          border: none;
          cursor: pointer;
          transition: background 0.15s, transform 0.1s;
        }
        .til-btn:hover:not(:disabled) { background: #f0d060; transform: translateY(-1px); }
        .til-btn:active:not(:disabled) { transform: translateY(0); }
        .til-btn:disabled { background: #1e1e2a; color: #3a3a4e; cursor: not-allowed; }
      `}</style>

      <div className="til-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ width: '100%', maxWidth: '340px' }}>

          {/* Brand */}
          <div className="fade-1" style={{ marginBottom: '36px' }}>
            <div style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '10px',
              color: '#9090a8',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              marginBottom: '10px',
            }}>
              vol. i — {new Date().getFullYear()}
            </div>
            <h1 style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: '52px',
              color: '#f0ece4',
              lineHeight: 1,
              margin: 0,
            }}>
              TIL
            </h1>
            <p style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '10px',
              color: '#9090a8',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginTop: '6px',
            }}>
              Creá tu cuenta
            </p>
          </div>

          {/* Gold rule */}
          <div className="fade-2" style={{
            height: '1px',
            background: 'linear-gradient(to right, #e8c547 0%, #2a2a3a 60%)',
            marginBottom: '32px',
          }} />

          {/* Form */}
          <form onSubmit={handleSubmit}>

            <div className="fade-3" style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '10px',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: '#9090a8',
                marginBottom: '8px',
              }}>
                Usuario
              </label>
              <input
                className="til-input-bare"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="tu_usuario"
              />
            </div>

            <div className="fade-4" style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '10px',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: '#9090a8',
                marginBottom: '8px',
              }}>
                Email
              </label>
              <input
                className="til-input-bare"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="tu@email.com"
              />
            </div>

            <div className="fade-5" style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '10px',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: '#9090a8',
                marginBottom: '8px',
              }}>
                Contraseña
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  className="til-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#9090a8',
                    padding: 0,
                    lineHeight: 0,
                  }}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
              <p style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '10px',
                color: '#9090a8',
                marginTop: '6px',
              }}>
                Mín. 8 chars, mayúscula, número y símbolo.
              </p>
            </div>

            <div className="fade-6" style={{ marginBottom: '32px' }}>
              <label style={{
                display: 'block',
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '10px',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: '#9090a8',
                marginBottom: '8px',
              }}>
                Confirmar contraseña
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  className="til-input"
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#9090a8',
                    padding: 0,
                    lineHeight: 0,
                  }}
                  aria-label={showConfirm ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  <EyeIcon open={showConfirm} />
                </button>
              </div>
            </div>

            {mutation.isError && (
              <p style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '11px',
                color: '#e85547',
                marginBottom: '16px',
              }}>
                {mutation.error.message}
              </p>
            )}

            <div className="fade-7">
              <button type="submit" disabled={mutation.isPending} className="til-btn">
                {mutation.isPending ? 'Creando cuenta...' : 'Crear cuenta →'}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div style={{ height: '1px', background: '#16161f', margin: '28px 0 20px' }} />
          <p style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '11px',
            color: '#9090a8',
            textAlign: 'center',
          }}>
            Ya tenés cuenta?{' '}
            <Link to="/login" style={{ color: '#e8c547', textDecoration: 'none' }}>
              Iniciá sesión
            </Link>
          </p>

        </div>
      </div>
    </>
  )
}

export default RegisterPage
