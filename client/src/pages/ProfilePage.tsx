import { useQuery } from "@tanstack/react-query";
import Header from "../components/Header";
import { useApi } from "../lib/useApi";
import { timeAgo } from "../utils/date";
import type { PostsResponse, User } from "../types/types";

export default function ProfilePage() {
  const authFetch = useApi();

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

        <main style={{ maxWidth: "600px", margin: "0 auto", padding: "32px 24px" }}>
          <div className="profile-card">
            <img 
              className="profile-avatar"
              src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${user?.username}&background=e8c547&color=0b0b0f`} 
              alt={user?.username} 
            />
            <div className="profile-info">
              <h1 className="profile-username">@{user?.username}</h1>
              <p className="profile-email">{user?.email}</p>
              {user?.bio && <p className="profile-bio">{user.bio}</p>}
            </div>
          </div>

          <h2 className="profile-posts-title">Mis Posts</h2>
          <div>
            {data?.posts.map((p) => (
                  <article key={p.id} className="profile-post-item">
                <p className="profile-post-content">{p.content}</p>
                <div className="profile-post-meta">
                  <span className="profile-post-category">{p.category}</span>
                  <span className="profile-post-date">{timeAgo(p.createdAt)}</span>
                </div>
              </article>
            ))}
          </div>
        </main>
      </div>
    </>
  );
}
