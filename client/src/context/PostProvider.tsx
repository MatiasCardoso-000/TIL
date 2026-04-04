import { useState } from "react";
import { PostContext } from "./PostContext";

export const PostProvider = ({ children }: { children: React.ReactNode }) => {
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("TECNOLOGIA");

 

  return (
    <PostContext.Provider
      value={{
        category,
        content,
        setContent,
        setCategory,
      }}
    >
      {children}
    </PostContext.Provider>
  );
};
