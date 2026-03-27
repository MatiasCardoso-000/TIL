import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useApi } from '../lib/useApi'
import { apiFetch } from '../lib/api'
import { useAuth } from '../hooks/useAuth'

const CATEGORIES = [
  { value: 'TECNOLOGIA', label: 'Tecnología' },
  { value: 'CIENCIA', label: 'Ciencia' },
  { value: 'HISTORIA', label: 'Historia' },
  { value: 'IDIOMAS', label: 'Idiomas' },
  { value: 'MATEMATICAS', label: 'Matemáticas' },
  { value: 'ARTE', label: 'Arte' },
  { value: 'SALUD', label: 'Salud' },
  { value: 'NEGOCIOS', label: 'Negocios' },
  { value: 'OTRO', label: 'Otro' },
]

interface Post {
  id: string
  content: string
  category: string
  createdAt: string
  user: { id: string; username: string }
}

interface PostsResponse {
  posts: Post[]
  pagination: {
    total: number
    page: number
    totalPages: number
    hasNext: boolean
  }
}

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (diff < 60) return 'ahora'
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  return `${Math.floor(diff / 86400)}d`
}

const MAX_CHARS = 280

function FeedPage() {
  const { user, logout } = useAuth()
  const authFetch = useApi()
  const queryClient = useQueryClient()

  const [page, setPage] = useState(1)
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('TECNOLOGIA')

  useEffect(() => {
    const link = document.createElement('link')
    link.href =
      'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Instrument+Serif:ital@0;1&display=swap'
    link.rel = 'stylesheet'
    document.head.appendChild(link)
    return () => { document.head.removeChild(link) }
  }, [])

  const { data, isLoading } = useQuery({
    queryKey: ['posts', page],
    queryFn: () => authFetch<PostsResponse>(`/posts?page=${page}`),
  })

  const createMutation = useMutation({
    mutationFn: () =>
      authFetch('/posts/create', {
        method: 'POST',
        body: JSON.stringify({ content, category }),
      }),
    onSuccess: () => {
      setContent('')
      setCategory('TECNOLOGIA')
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
  })

  const handleLogout = async () => {
    await apiFetch('/logout', { method: 'POST' }).catch(() => {})
    logout()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    createMutation.mutate()
  }

  const charsLeft = MAX_CHARS - content.length

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .til-bg {
          background-color: #0b0b0f;
          background-image: radial-gradient(circle at 1px 1px, #16161f 1px, transparent 0);
          background-size: 28px 28px;
        }
        .til-header {
          background: rgba(11, 11, 15, 0.92);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid #16161f;
          position: sticky;
          top: 0;
          z-index: 10;
        }
        .til-textarea {
          background: transparent;
          border: none;
          color: #f0ece4;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 13px;
          line-height: 1.7;
          resize: none;
          width: 100%;
          outline: none;
        }
        .til-textarea::placeholder { color: #9090a8; }
        .til-select {
          background: transparent;
          border: 1px solid #22222e;
          color: #9090a8;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 5px 10px;
          outline: none;
          cursor: pointer;
          transition: border-color 0.2s, color 0.2s;
        }
        .til-select:focus { border-color: #e8c547; color: #f0ece4; }
        .til-select option { background: #0f0f17; color: #f0ece4; }
        .til-btn-publish {
          background: #e8c547;
          color: #0b0b0f;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          padding: 8px 18px;
          border: none;
          cursor: pointer;
          transition: background 0.15s, transform 0.1s;
          white-space: nowrap;
        }
        .til-btn-publish:hover:not(:disabled) { background: #f0d060; transform: translateY(-1px); }
        .til-btn-publish:active:not(:disabled) { transform: translateY(0); }
        .til-btn-publish:disabled { background: #2a2a3a; color: #5a5a6e; cursor: not-allowed; }
        .til-post {
          border-top: 1px solid #16161f;
          padding: 20px 0;
          animation: fadeIn 0.3s ease forwards;
        }
        .til-post:last-child { border-bottom: 1px solid #16161f; }
        .til-category {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 9px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #e8c547;
          border: 1px solid #2e2818;
          padding: 2px 8px;
          background: rgba(232, 197, 71, 0.06);
        }
        .til-logout {
          background: none;
          border: none;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #9090a8;
          cursor: pointer;
          padding: 0;
          transition: color 0.15s;
        }
        .til-logout:hover { color: #e85547; }
        .til-page-btn {
          background: none;
          border: none;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #9090a8;
          cursor: pointer;
          padding: 6px 0;
          transition: color 0.15s;
        }
        .til-page-btn:hover:not(:disabled) { color: #e8c547; }
        .til-page-btn:disabled { color: #22222e; cursor: not-allowed; }
        .fade-1 { animation: fadeUp 0.4s ease 0.0s forwards; opacity: 0; }
        .fade-2 { animation: fadeUp 0.4s ease 0.08s forwards; opacity: 0; }
        .fade-3 { animation: fadeUp 0.4s ease 0.16s forwards; opacity: 0; }
      `}</style>

      <div className="til-bg" style={{ minHeight: '100vh' }}>

        {/* Header */}
        <header className="til-header">
          <div style={{
            maxWidth: '600px',
            margin: '0 auto',
            padding: '0 24px',
            height: '52px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
              <span style={{
                fontFamily: "'Instrument Serif', serif",
                fontSize: '24px',
                color: '#f0ece4',
                lineHeight: 1,
              }}>
                TIL
              </span>
              <span style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '9px',
                color: '#9090a8',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
              }}>
                Today I Learned
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '11px',
                color: '#9090a8',
              }}>
                @{user?.username}
              </span>
              <button className="til-logout" onClick={handleLogout}>
                Salir
              </button>
            </div>
          </div>
        </header>

        <main style={{ maxWidth: '600px', margin: '0 auto', padding: '32px 24px' }}>

          {/* Composer */}
          <div className="fade-1" style={{ marginBottom: '40px' }}>
            <div style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '9px',
              color: '#9090a8',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              marginBottom: '14px',
            }}>
              Nueva entrada
            </div>

            <div style={{
              height: '1px',
              background: 'linear-gradient(to right, #e8c547, #22222e)',
              marginBottom: '16px',
            }} />

            <form onSubmit={handleSubmit}>
              <textarea
                className="til-textarea"
                value={content}
                onChange={(e) => setContent(e.target.value.slice(0, MAX_CHARS))}
                placeholder="¿Qué aprendiste hoy?"
                rows={3}
              />

              <div style={{
                height: '1px',
                background: '#16161f',
                margin: '12px 0',
              }} />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <select
                  className="til-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <span style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: '11px',
                    color: charsLeft <= 20 ? '#e85547' : '#9090a8',
                    transition: 'color 0.2s',
                    minWidth: '28px',
                    textAlign: 'right',
                  }}>
                    {charsLeft}
                  </span>
                  <button
                    type="submit"
                    disabled={!content.trim() || createMutation.isPending}
                    className="til-btn-publish"
                  >
                    {createMutation.isPending ? 'Publicando...' : 'Publicar →'}
                  </button>
                </div>
              </div>

              {createMutation.isError && (
                <p style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '11px',
                  color: '#e85547',
                  marginTop: '10px',
                }}>
                  {createMutation.error.message}
                </p>
              )}
            </form>
          </div>

          {/* Feed */}
          <div className="fade-2">
            {isLoading ? (
              <div style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '11px',
                color: '#9090a8',
                textAlign: 'center',
                padding: '48px 0',
                letterSpacing: '0.1em',
              }}>
                Cargando...
              </div>
            ) : data?.posts.length === 0 ? (
              <div style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '11px',
                color: '#9090a8',
                textAlign: 'center',
                padding: '48px 0',
                letterSpacing: '0.1em',
              }}>
                No hay posts todavía.
              </div>
            ) : (
              <div>
                {data?.posts.map((post) => (
                  <article key={post.id} className="til-post">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{
                          fontFamily: "'IBM Plex Mono', monospace",
                          fontSize: '12px',
                          color: '#f0ece4',
                          fontWeight: 500,
                        }}>
                          @{post.user.username}
                        </span>
                        <span className="til-category">
                          {CATEGORIES.find((c) => c.value === post.category)?.label ?? post.category}
                        </span>
                      </div>
                      <span style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: '10px',
                        color: '#9090a8',
                      }}>
                        {timeAgo(post.createdAt)}
                      </span>
                    </div>
                    <p style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: '13px',
                      color: '#c8c4bc',
                      lineHeight: 1.75,
                      margin: 0,
                    }}>
                      {post.content}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </div>

          {/* Paginación */}
          {data && data.pagination.totalPages > 1 && (
            <div className="fade-3" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '24px',
              paddingTop: '32px',
              borderTop: '1px solid #16161f',
              marginTop: '8px',
            }}>
              <button
                className="til-page-btn"
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 1}
              >
                ← Anterior
              </button>
              <span style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '10px',
                color: '#9090a8',
                letterSpacing: '0.1em',
              }}>
                {page} / {data.pagination.totalPages}
              </span>
              <button
                className="til-page-btn"
                onClick={() => setPage((p) => p + 1)}
                disabled={!data.pagination.hasNext}
              >
                Siguiente →
              </button>
            </div>
          )}

        </main>
      </div>
    </>
  )
}

export default FeedPage
