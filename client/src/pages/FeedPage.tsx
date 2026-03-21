import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import { useApi } from '../lib/useApi'
import { apiFetch } from '../lib/api'

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
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navbar */}
      <header className="border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <span className="font-bold text-lg">TIL</span>
        <div className="flex items-center gap-3">
          <span className="text-gray-400 text-sm">@{user?.username}</span>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Salir
          </button>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-6 space-y-6">
        {/* Crear post */}
        <form onSubmit={handleSubmit} className="bg-gray-900 rounded-xl p-4 space-y-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value.slice(0, MAX_CHARS))}
            placeholder="¿Qué aprendiste hoy?"
            rows={3}
            className="w-full bg-transparent text-white placeholder-gray-500 resize-none focus:outline-none text-sm"
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="bg-gray-800 text-gray-300 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs ${charsLeft <= 20 ? 'text-red-400' : 'text-gray-500'}`}>
                {charsLeft}
              </span>
              <button
                type="submit"
                disabled={!content.trim() || createMutation.isPending}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg px-4 py-1.5 transition-colors"
              >
                {createMutation.isPending ? 'Publicando...' : 'Publicar'}
              </button>
            </div>
          </div>
          {createMutation.isError && (
            <p className="text-red-400 text-xs">{createMutation.error.message}</p>
          )}
        </form>

        {/* Lista de posts */}
        {isLoading ? (
          <div className="text-gray-500 text-sm text-center py-8">Cargando...</div>
        ) : data?.posts.length === 0 ? (
          <div className="text-gray-500 text-sm text-center py-8">No hay posts todavía.</div>
        ) : (
          <div className="space-y-3">
            {data?.posts.map((post) => (
              <article key={post.id} className="bg-gray-900 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-300">@{post.user.username}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-gray-800 text-gray-400 rounded-full px-2 py-0.5">
                      {CATEGORIES.find((c) => c.value === post.category)?.label ?? post.category}
                    </span>
                    <span className="text-xs text-gray-600">{timeAgo(post.createdAt)}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-100 leading-relaxed">{post.content}</p>
              </article>
            ))}
          </div>
        )}

        {/* Paginación */}
        {data && data.pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 pt-2">
            <button
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 1}
              className="text-sm text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Anterior
            </button>
            <span className="text-sm text-gray-500">
              {page} / {data.pagination.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!data.pagination.hasNext}
              className="text-sm text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

export default FeedPage
