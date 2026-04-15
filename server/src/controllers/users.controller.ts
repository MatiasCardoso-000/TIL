import prisma from "../lib/prisma.js";
import type { Request, Response } from "express";
import type { User } from "../types/types.js";

const getSuggested = async (req: Request, res: Response) => {
  try {
    const currentUserId = req.userId!;

    // Get IDs of users the current user already follows
    const following = await prisma.follow.findMany({
      where: { followerId: currentUserId },
      select: { followingId: true },
    });

    const followingIds = following.map((f) => f.followingId);

    // Get 10 users that are NOT followed by current user (and exclude self)
    const users = await prisma.user.findMany({
      where: {
        id: {
          not: currentUserId,
          ...(followingIds.length > 0 ? { notIn: followingIds } : {}),
        },
      },
      take: 10,
      select: {
        id: true,
        username: true,
        avatarUrl: true,
        bio: true,
      },
    });

    return res.status(200).json({ users });
  } catch (error) {
    console.error("[ERROR GET SUGGESTED]", error);
    return res.status(500).json({ message: "Error interno" });
  }
};

const getUserProfile = async (
  req: Request,
  res: Response,
): Promise<Response<User>> => {
  try {
    const userId = req.params.userId as string;

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        username: true,
        id: true,
        email: true,
        avatarUrl: true,
        bio: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ errors: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("[ME ERROR]", error);
    return res.status(500).json({ errors: "Internal Server Error" });
  }
};

export const UsersController = {
  getSuggested,
  getUserProfile,
};
