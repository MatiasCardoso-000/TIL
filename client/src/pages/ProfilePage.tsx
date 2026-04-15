import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "../components/Header";
import { useApi } from "../lib/useApi";
import { timeAgo } from "../utils/date";
import type { AuthState, PostsResponse, User } from "../types/types";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { SkeletonProfile } from "../components/Skeleton";

export default function ProfilePage() {
  const authFetch = useApi();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: "",
    email: "",
    bio: "",
    avatarUrl: "",
  });
  const { user: currentUser } = useAuth();

  const { userId } = useParams();

  const queryClient = useQueryClient();

  const updatedUserMutation = useMutation({
    mutationFn: () =>
      authFetch<AuthState>("/profile", {
        method: "PUT",
        body: JSON.stringify(editForm),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setIsEditing(false);
    },
  });

  const deleteFollowMutation = useMutation({
    mutationFn: (userId: string | undefined) =>
      authFetch<AuthState>(`/follow/${userId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["followers"] });
    },
  });

  const followMutation = useMutation({
    mutationFn: (userId: string | undefined) =>
      authFetch(`/follow/${userId}`, {
        method: "POST",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["followers"] });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  const {
    data: user,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["users", userId],
    queryFn: () => authFetch<User>(`/users/${userId}`),
  });

  const { data } = useQuery({
    queryKey: ["posts"],
    queryFn: () => authFetch<PostsResponse>(`/posts?userId=${userId}`),
  });

  const { data: followersData } = useQuery({
    queryKey: ["followers", userId],
    queryFn: () => authFetch<User[]>(`/follow/followers/${userId}`),
    enabled: !!userId,
  });

  const { data: followingData } = useQuery({
    queryKey: ["following", userId],
    queryFn: () => authFetch<User[]>(`/follow/following/${userId}`),
    enabled: !!userId,
  });

  if (isError) return (
    <div className="til-bg" style={{ minHeight: "100vh" }}>
      <Header />
      <main style={{ maxWidth: "600px", margin: "0 auto", padding: "32px 24px" }}>
        <div className="profile-card" style={{ textAlign: "center", padding: "40px 24px" }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", color: "var(--error)", fontSize: "14px" }}>
            No se pudo cargar el perfil. Intentá de nuevo más tarde.
          </p>
        </div>
      </main>
    </div>
  );

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
                {isLoading ? (
                  <SkeletonProfile />
                ) : (
                  <>
                    <div className="profile-card-header">
                      {currentUser?.id == userId && (
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
                      )}
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
                      <div>
                        <h1 className="profile-username">@{user?.username}</h1>
                        <span className="flex gap-4">
                          <p> Seguidores: {followersData?.length}</p>

                          <p>Seguidos: {followingData?.length}</p>
                        </span>
                      </div>
                      <p className="profile-email">{user?.email}</p>
                      {user?.bio ? (
                        <p className="profile-bio">{user.bio}</p>
                      ) : (
                        <p>No hay bio</p>
                      )}
                    </div>
                    {currentUser?.id !== userId && (
                      <>
                        {" "}
                        {followersData?.some(
                          (f) => f.id === currentUser?.id,
                        ) ? (
                          <button
                            onClick={() => deleteFollowMutation.mutate(userId)}
                            disabled={followMutation.isPending}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "8px",
                              padding: "8px 12px",
                              borderRadius: "999px",
                              border: "1px solid var(--border)",
                              background: "transparent",
                              color: "var(--text-primary)",
                              fontFamily: "'DM Sans', sans-serif",
                              fontSize: "12px",
                              fontWeight: 600,
                              cursor: followMutation.isPending
                                ? "not-allowed"
                                : "pointer",
                              opacity: followMutation.isPending ? 0.7 : 1,
                              flexShrink: 0,
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
                              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                              <circle cx="9" cy="7" r="4" />
                              <line x1="22" y1="11" x2="16" y2="11" />
                            </svg>
                            <span>
                              {deleteFollowMutation.isPending
                                ? "Unfollowing..."
                                : "Unfollow"}
                            </span>
                          </button>
                        ) : (
                          <button
                            onClick={() => followMutation.mutate(userId)}
                            disabled={followMutation.isPending}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "8px",
                              padding: "8px 12px",
                              borderRadius: "999px",
                              border: "1px solid var(--border)",
                              background: "transparent",
                              color: "var(--text-primary)",
                              fontFamily: "'DM Sans', sans-serif",
                              fontSize: "12px",
                              fontWeight: 600,
                              cursor: followMutation.isPending
                                ? "not-allowed"
                                : "pointer",
                              opacity: followMutation.isPending ? 0.7 : 1,
                              flexShrink: 0,
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
                              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                              <circle cx="9" cy="7" r="4" />
                              <line x1="19" y1="8" x2="19" y2="14" />
                              <line x1="22" y1="11" x2="16" y2="11" />
                            </svg>
                            <span>
                              {followMutation.isPending
                                ? "Following..."
                                : "Follow"}
                            </span>
                          </button>
                        )}{" "}
                      </>
                    )}
                  </>
                )}
              </>
            )}
          </div>

          {currentUser?.id === userId ? (
            <h2 className="profile-posts-title">Mis Posts</h2>
          ) : (
            <h2 className="profile-posts-title">Post de {user?.username}</h2>
          )}
          {data && data?.posts.length > 0 ? (
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
          ) : (
            <div>
              <p>No hay posts</p>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
