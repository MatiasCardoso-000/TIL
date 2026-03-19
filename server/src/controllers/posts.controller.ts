import type { Request, Response } from "express";
import prisma from "../lib/prisma.js";

const createPost = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { content, category } = req.body;
    const userId = req.userId!;

    if (!content || !category) {
      return res
        .status(400)
        .json({ message: "content and category are required" });
    }

    const post = await prisma.post.create({
      data: { content, category, userId },
      select: {
        id: true,
        content: true,
        category: true,
        createdAt: true,
      },
    });

    return res.status(201).json({ message: "Post created", post });
  } catch (error) {
    console.log("POST CREATION ERROR", error);
    return res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};

const POSTS_PER_PAGE = 10;

const getPosts = async (req: Request, res: Response): Promise<Response> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const skip = (page - 1) * POSTS_PER_PAGE;

    const [posts, total] = await prisma.$transaction([
      prisma.post.findMany({
        skip,
        take: POSTS_PER_PAGE,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          content: true,
          category: true,
          createdAt: true,
          user: {
            select: { id: true, username: true },
          },
        },
      }),
      prisma.post.count(),
    ]);

    return res.status(200).json({
      posts,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / POSTS_PER_PAGE),
        hasNext: skip + posts.length < total,
      },
    });
  } catch (error) {
    console.log("ERROR GETTING POSTS", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getPostById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const post = await prisma.post.findUnique({
      where: {
        id,
      },
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    return res.status(200).json({ post });
  } catch (error) {
    console.log("ERROR GETTING POST", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const updatePost = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const { content, category } = req.body;
    if (!content && !category) {
      return res.status(400).json({ message: "At least one field required" });
    }
    const updatedPost = await prisma.post
      .update({
        where: {
          id,
          userId: req.userId!,
        },
        data: {
          ...(content && { content }),
          ...(category && { category }),
        },
      })
      .catch((e) => {
        if (e.code === "P2025") return null;
        throw e;
      });

    if (!updatedPost)
      return res.status(404).json({ message: "Post not found" });

    return res.status(200).json({ updatedPost });
  } catch (error) {
    console.log("ERROR UPDATING POST", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const PostsController = {
  createPost,
  getPosts,
  getPostById,
  updatePost,
};
