export interface Post {
  id: string;
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
