import { useContext } from "react";
import { PostContext } from "../context/PostContext";

export const usePosts = () => {
  const context = useContext(PostContext);

  if (!context) {
    throw new Error("usePost must be within a provider");
  }

  return context;
};
