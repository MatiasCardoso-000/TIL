import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApi } from "../lib/useApi";
import { timeAgo } from "../utils/date";
import Header from "../components/Header";
import Form from "../components/Form";
import type { PostsResponse } from "../types/types";

type ErrorType = Error & {
  data?: unknown;
};

function FeedPage() {
  const authFetch = useApi();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [error, setError] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    content?: string[];
  }>({});
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const MAX_CHARS = 280;

  // Load distinctive fonts — avoid reflex fonts (IBM Plex Mono, Space Grotesk, etc.)
  useEffect(() => {
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const updateMutationPost = useMutation({
    mutationFn: (postId) =>
      authFetch(`/posts/${postId}`, {
        method: "PUT",
        body: JSON.stringify({ content: editContent }),
      }),
    onSuccess: (_: unknown, postId: number) => {
      queryClient.setQueryData(["posts", page], (old: PostsResponse) => ({
        ...old,
        posts: old.posts.map((p) => {
          return p.id === postId ? { ...p, content: editContent } : p;
        }),
      }));
      setEditingPostId(null);
      setEditContent("");
      setFieldErrors({});
    },
    onError: (err: ErrorType) =>
      setFieldErrors(
        (err.data as { errors?: Record<string, string[]> })?.errors ?? {},
      ),
  });

  const deletePostMutation = useMutation({
    mutationFn: (postId) =>
      authFetch(`/posts/${postId}`, {
        method: "DELETE",
      }),
    onSuccess: (_: unknown, postId: number) => {
      queryClient.setQueryData(["posts", page], (old: PostsResponse) => ({
        ...old,
        posts: old.posts.filter((post) => post.id !== postId),
      }));
    },
    onError: () => {
      setError(true);
      setTimeout(() => {
        setError(false);
      }, 4000);
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (editContent.trim().length < 10) return;
  };

  const { data, isLoading } = useQuery({
    queryKey: ["posts", page],
    queryFn: () => authFetch<PostsResponse>(`/posts?page=${page}`),
  });

  const CATEGORIES = [
    { value: "TECNOLOGIA", label: "Tecnología" },
    { value: "CIENCIA", label: "Ciencia" },
    { value: "HISTORIA", label: "Historia" },
    { value: "IDIOMAS", label: "Idiomas" },
    { value: "MATEMATICAS", label: "Matemáticas" },
    { value: "ARTE", label: "Arte" },
    { value: "SALUD", label: "Salud" },
    { value: "NEGOCIOS", label: "Negocios" },
    { value: "OTRO", label: "Otro" },
  ];

  return (
    <>
      <div className="til-bg" style={{ minHeight: "100vh" }}>
        <Header />

        <main
          style={{ maxWidth: "600px", margin: "0 auto", padding: "32px 24px" }}
        >
          {error && (
            <div className="til-error">
              <p className="til-error__text ">
                Hubo un error. Por favor intenta de nuevo.
              </p>
            </div>
          )}
          {/* Composer */}
          <div className="fade-1" style={{ marginBottom: "40px" }}>
            <div className="til-label">Nueva entrada</div>
            <Form />
            <div
              aria-hidden="true"
              style={{
                height: "1px",
                background: "var(--border)",
                marginBottom: "16px",
              }}
            />
          </div>

          {/* Feed */}
          <div className="fade-2">
            {isLoading ? (
              <div
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "11px",
                  color: "var(--text-secondary)",
                  textAlign: "center",
                  padding: "48px 0",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Cargando...
              </div>
            ) : data?.posts.length === 0 ? (
              <div
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "11px",
                  color: "var(--text-secondary)",
                  textAlign: "center",
                  padding: "48px 0",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                No hay posts todavía.
              </div>
            ) : (
              <div>
                {data?.posts.map((post) => (
                  <article key={post.id} className="til-post">
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "12px",
                      }}
                    >
                      <div className="flex justify-between w-full pr-6">
                        <div className="flex gap-4">
                          <span
                            style={{
                              fontFamily: "'DM Sans', sans-serif",
                              fontSize: "12px",
                              color: "var(--text-primary)",
                              fontWeight: 500,
                            }}
                          >
                            @{post.user.username}
                          </span>
                          <span className="til-category">
                            {CATEGORIES.find((c) => c.value === post.category)
                              ?.label ?? post.category}
                          </span>
                        </div>
                        <div className="flex gap-4">
                          <span>
                            <button
                              aria-label="Eliminar post"
                              className="post-action-btn"
                              onClick={() => deletePostMutation.mutate(post.id)}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              </svg>
                            </button>
                          </span>
                          <span>
                            <button
                              aria-label="Editar post"
                              className="post-action-btn"
                              onClick={() => {
                                setEditingPostId(post.id);
                                setEditContent(post.content);
                              }}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                              </svg>
                            </button>
                          </span>
                        </div>
                      </div>
                      <span
                        style={{
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: "10px",
                          color: "var(--text-tertiary)",
                          letterSpacing: "0.05em",
                        }}
                      >
                        {timeAgo(post.createdAt)}
                      </span>
                    </div>
                    {post.id === editingPostId ? (
                      <form onSubmit={handleSubmit}>
                        <textarea
                          className="til-textarea"
                          onChange={(e) =>
                            setEditContent(e.target.value.slice(0, MAX_CHARS))
                          }
                          value={editContent}
                          rows={3}
                        ></textarea>
                        <div className="flex gap-3" style={{ marginTop: "12px" }}>
                          <button
                            aria-label="Guardar cambios"
                            className="edit-action-btn edit-action-btn--save"
                            onClick={() => updateMutationPost.mutate(post.id)}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            <span>Guardar</span>
                          </button>
                          <button
                            aria-label="Cancelar edición"
                            className="edit-action-btn edit-action-btn--cancel"
                            onClick={() => {
                              setEditingPostId(null);
                              setEditContent("");
                            }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <line x1="18" y1="6" x2="6" y2="18"></line>
                              <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                            <span>Cancelar</span>
                          </button>
                        </div>
                        {fieldErrors.content?.map((e) => (
                          <div className="til-error mt-4" key={post.id}>
                            <p className="til-error__text">{e}</p>
                          </div>
                        ))}
                      </form>
                    ) : (
                      <p
                        style={{
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: "14px",
                          color: "var(--text-primary)",
                          lineHeight: 1.7,
                          margin: 0,
                        }}
                      >
                        {post.content}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>

          {/* Paginación */}
          {data && data.pagination.totalPages > 1 && (
            <div
              className="fade-3"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "24px",
                paddingTop: "32px",
                borderTop: "1px solid var(--post-border)",
                marginTop: "8px",
              }}
            >
              <button
                className="til-page-btn"
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 1}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>
<span
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "10px",
                    color: "var(--text-secondary)",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  {page} / {data.pagination.totalPages}
                </span>
              <button
                className="til-page-btn"
                onClick={() => setPage((p) => p + 1)}
                disabled={!data.pagination.hasNext}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>
          )}
        </main>
      </div>
    </>
  );
}

export default FeedPage;
