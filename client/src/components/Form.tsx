import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "../lib/useApi";
import type { PostsResponse } from "../types/types";
import { usePosts } from "../hooks/usePosts";
import { useState} from "react";


export default function Form() {
  const MAX_CHARS = 280;
  const authFetch = useApi();
  const { content, category, setContent, setCategory } = usePosts();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: () =>
      authFetch<PostsResponse>("/posts", {
        method: "POST",
        body: JSON.stringify({ content, category }),
      }),
    onSuccess: () => {
      setContent("");
      setCategory("TECNOLOGIA");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (trimmed.length < 10) {
      setError("El contenido debe al menos tener 10 caracteres");
      return;
    }
    setError("");
    setIsSubmitting(true);

    try {
      await createMutation.mutateAsync();
      await new Promise((r) => setTimeout(r, 500));
    } finally {
      setIsSubmitting(false);
    }
  };

  const charsLeft = MAX_CHARS - content.length;

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
    <form onSubmit={handleSubmit}>
      <textarea
        className="til-textarea"
        value={content}
        onChange={(e) => setContent(e.target.value.slice(0, MAX_CHARS))}
        placeholder="¿Qué aprendiste hoy?"
        rows={3}
      />

      <div
        style={{
          height: "1px",
          background: "#16161f",
          margin: "12px 0",
        }}
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <select
          className="til-select"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>

        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: "11px",
              color: charsLeft <= 20 ? "#e85547" : "#9090a8",
              transition: "color 0.2s",
              minWidth: "28px",
              textAlign: "right",
            }}
          >
            {charsLeft}
          </span>
          <button
            type="submit"
            disabled={!content.trim() || createMutation.isPending}
            className="til-btn-publish"
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              {isSubmitting && (
                <span className="til-spinner" aria-hidden="true" />
              )}
              {isSubmitting ? "Publicando..." : "Publicar →"}
            </span>
          </button>
        </div>
      </div>

      {error && (
        <p
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: "11px",
            color: "#e85547",
            marginTop: "10px",
          }}
        >
          {error}
        </p>
      )}
    </form>
  );
}






  