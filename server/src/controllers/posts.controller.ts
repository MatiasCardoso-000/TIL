import type { Request, Response } from "express";
import prisma from "../lib/prisma.js";

const createPost = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { content, category } = req.body;
    const userId = req.userId!;

    const post = await prisma.post.create({
      data: { content, category, userId },
      select: {
        id: true,
        content: true,
        category: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    return res.status(201).json({ message: "Post created", post });
  } catch (error) {
    console.error("[POST CREATION ERROR]", error);
    return res.status(500).json({
      errors: "Error interno del servidor",
    });
  }
};

const POSTS_PER_PAGE = 10;

const getPosts = async (req: Request, res: Response): Promise<Response> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const skip = (page - 1) * POSTS_PER_PAGE;
    const userId = req.query.userId as string;

    const [posts, total] = await prisma.$transaction([
      prisma.post.findMany({
        where: {
          userId: userId,
        },
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
      prisma.post.count({
        where: {
          userId: userId,
        },
      }),
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
    console.error("[ERROR GETTING POSTS]", error);
    return res.status(500).json({ errors: "Internal server error" });
  }
};

const getPostById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const id = req.params.id as string;

    const post = await prisma.post.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        content: true,
        category: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    if (!post) {
      return res.status(404).json({ errors: "Post not found" });
    }

    return res.status(200).json({ post });
  } catch (error) {
    console.error("[ERROR GETTING POST]", error);
    return res.status(500).json({ errors: "Internal server error" });
  }
};

const updatePost = async (req: Request, res: Response): Promise<Response> => {
  try {
    const id = req.params.id as string;

    const { content, category } = req.body;

    if (!content && !category) {
      return res.status(400).json({ errors: "At least one field required" });
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

    if (!updatedPost) return res.status(404).json({ errors: "Post not found" });

    return res.status(200).json({ updatedPost });
  } catch (error) {
    console.error("[ERROR UPDATING POST]", error);
    return res.status(500).json({ errors: "Internal server error" });
  }
};

const deletePost = async (req: Request, res: Response): Promise<Response> => {
  try {
    const id = req.params.id as string;

    const deletedPost = await prisma.post
      .delete({
        where: {
          id,
          userId: req.userId!,
        },
      })
      .catch((e) => {
        if (e.code === "P2025") return null;
        throw e;
      });

    if (!deletedPost) {
      return res.status(404).json({ errors: "Post not found" });
    }

    return res.status(200).json({});
  } catch (error) {
    console.error("[ERROR DELETING POST]", error);
    return res.status(500).json({ errors: "Internal server error" });
  }
};
export const PostsController = {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
};
