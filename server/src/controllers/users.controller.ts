import prisma from "../lib/prisma.js";
import type { Request, Response } from "express";

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

export const UsersController = {
  getSuggested,
};