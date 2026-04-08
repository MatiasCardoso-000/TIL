export interface User {
  id: number;
  username: string;
  email: string;
  avatarUrl: string | null;
  bio: string | null;
  createdAt: Date;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
}


export interface Post {
  id: number;
  content: string;
  category: string;
  createdAt: string;
  user: { id: string; username: string };
}


export interface PostsResponse {
  posts: Post[];
  pagination: {
    total: number;
    page: number;
    totalPages: number;
    hasNext: boolean;
  };
}
