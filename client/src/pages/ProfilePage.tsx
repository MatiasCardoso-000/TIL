import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "../components/Header";
import { useApi } from "../lib/useApi";
import { timeAgo } from "../utils/date";
import type { AuthState, PostsResponse, User } from "../types/types";
import { useState } from "react";

export default function ProfilePage() {
  const authFetch = useApi();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: "",
    email: "",
    bio: "",
    avatarUrl: "",
  });

  const queryClient = useQueryClient();

  const updatedUserMutation = useMutation({
    mutationFn: () =>
      authFetch<AuthState>("/profile", {
        method: "PUT",
        body: JSON.stringify(editForm),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      setIsEditing(false);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => authFetch<User>("/me"),
  });

  const { data } = useQuery({
    queryKey: ["posts"],
    queryFn: () => authFetch<PostsResponse>("/posts?mine=true"),
  });

  return (
    <>
      <div className="til-bg" style={{ minHeight: "100vh" }}>
        <Header />

        <main
          style={{ maxWidth: "600px", margin: "0 auto", padding: "32px 24px" }}
        >
          <div className="profile-card">
            {isEditing ? (
              <form onSubmit={handleSubmit}>
                <div className="flex items-center gap-4 mb-4">
                  <img
                    className="profile-avatar"
                    src={
                      editForm.avatarUrl ||
                      `https://ui-avatars.com/api/?name=${editForm.username || user?.username}&background=e8c547&color=0b0b0f`
                    }
                    alt={editForm.username}
                  />
                  <div className="flex-1">
                    <label className="til-label">URL del avatar</label>
                    <input
                      type="text"
                      className="til-input"
                      value={editForm.avatarUrl}
                      onChange={(e) =>
                        setEditForm({ ...editForm, avatarUrl: e.target.value })
                      }
                      placeholder="https://ejemplo.com/avatar.jpg"
                    />
                  </div>
                </div>
                <div className="profile-info">
                  <div className="mb-3">
                    <label className="til-label">Usuario</label>
                    <input
                      type="text"
                      className="til-input"
                      value={editForm.username}
                      onChange={(e) =>
                        setEditForm({ ...editForm, username: e.target.value })
                      }
                    />
                  </div>
                  <div className="mb-3">
                    <label className="til-label">Email</label>
                    <input
                      className="til-input"
                      type="text"
                      value={editForm.email}
                      onChange={(e) =>
                        setEditForm({ ...editForm, email: e.target.value })
                      }
                    />
                  </div>
                  <div className="mb-3">
                    <label className="til-label">Bio</label>
                    <input
                      className="til-input"
                      type="text"
                      value={editForm.bio}
                      onChange={(e) =>
                        setEditForm({ ...editForm, bio: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    aria-label="Guardar cambios"
                    className="edit-action-btn edit-action-btn--save"
                    onClick={() => updatedUserMutation.mutate()}
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
                      setEditForm({
                        username: "",
                        email: "",
                        bio: "",
                        avatarUrl: "",
                      });
                      setIsEditing(false);
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
              </form>
            ) : (
              <>
                <div className="profile-card-header">
                  <button
                    className="post-action-btn"
                    style={{ marginTop: "4px" }}
                    onClick={() => {
                      setEditForm({
                        username: user?.username || "",
                        email: user?.email || "",
                        bio: user?.bio || "",
                        avatarUrl: user?.avatarUrl || "",
                      });
                      setIsEditing(true);
                    }}
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
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                </div>
                <div className="flex">
                  <img
                    className="profile-avatar"
                    src={
                      user?.avatarUrl ||
                      `https://ui-avatars.com/api/?name=${user?.username}&background=e8c547&color=0b0b0f`
                    }
                    alt={user?.username}
                  />
                </div>
                <div className="profile-info">
                  <h1 className="profile-username">@{user?.username}</h1>
                  <p className="profile-email">{user?.email}</p>
                  {user?.bio ? (
                    <p className="profile-bio">{user.bio}</p>
                  ) : (
                    <p>No hay bio</p>
                  )}
                </div>
              </>
            )}
          </div>

          <h2 className="profile-posts-title">Mis Posts</h2>
          <div>
            {data?.posts.map((p) => (
              <article key={p.id} className="profile-post-item">
                <p className="profile-post-content">{p.content}</p>
                <div className="profile-post-meta">
                  <span className="profile-post-category">{p.category}</span>
                  <span className="profile-post-date">
                    {timeAgo(p.createdAt)}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </main>
      </div>
    </>
  );
}
