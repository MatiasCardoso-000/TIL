import { createContext, type Dispatch, type SetStateAction } from "react";

export interface PostContextType {
  content: string;
  category: string;
  setContent: Dispatch<SetStateAction<string>>;
  setCategory: Dispatch<SetStateAction<string>>;
}

export const PostContext = createContext<PostContextType | null>(null);
