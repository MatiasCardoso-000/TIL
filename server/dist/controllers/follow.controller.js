import prisma from "../lib/prisma.js";
const follow = async (req, res) => {
    try {
        const followingId = req.params.userId;
        const followerId = req.userId;
        // Can't follow yourself
        if (followerId === followingId) {
            return res.status(400).json({ message: "No puedes seguirte a ti mismo" });
        }
        // Check if user exists
        const userToFollow = await prisma.user.findUnique({
            where: { id: followingId },
        });
        if (!userToFollow) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }
        // Check if already following
        const existingFollow = await prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId,
                    followingId,
                },
            },
        });
        if (existingFollow) {
            return res.status(400).json({ message: "Ya sigues a este usuario" });
        }
        // Create follow
        const follow = await prisma.follow.create({
            data: {
                followerId,
                followingId,
            },
        });
        return res.status(201).json(follow);
    }
    catch (error) {
        console.error("[ERROR FOLLOW]", error);
        return res.status(500).json({ message: "Error interno" });
    }
};
const unfollow = async (req, res) => {
    try {
        const followingId = req.params.userId;
        const followerId = req.userId;
        const follow = await prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId,
                    followingId,
                },
            },
        });
        if (!follow) {
            return res.status(404).json({ message: "No sigues a este usuario" });
        }
        await prisma.follow.delete({
            where: { id: follow.id },
        });
        return res.status(200).json({ message: "Has dejado de seguir al usuario" });
    }
    catch (error) {
        console.error("[ERROR UNFOLLOW]", error);
        return res.status(500).json({ message: "Error interno" });
    }
};
const getFollowers = async (req, res) => {
    try {
        const userId = req.params.userId;
        const followers = await prisma.follow.findMany({
            where: { followingId: userId },
            include: {
                follower: {
                    select: {
                        id: true,
                        username: true,
                        avatarUrl: true,
                        bio: true,
                    },
                },
            },
        });
        const userFollowers = followers.map((f) => f.follower);
        return res.status(200).json(userFollowers);
    }
    catch (error) {
        console.error("[ERROR GET FOLLOWERS]", error);
        return res.status(500).json({ message: "Error interno" });
    }
};
const getFollowing = async (req, res) => {
    try {
        const userId = req.params.userId;
        const following = await prisma.follow.findMany({
            where: { followerId: userId },
            include: {
                following: {
                    select: {
                        id: true,
                        username: true,
                        avatarUrl: true,
                        bio: true,
                    },
                },
            },
        });
        const userFollowing = following.map((f) => f.following);
        return res.status(200).json(userFollowing);
    }
    catch (error) {
        console.error("[ERROR GET FOLLOWING]", error);
        return res.status(500).json({ message: "Error interno" });
    }
};
export const FollowController = {
    follow,
    unfollow,
    getFollowers,
    getFollowing,
};
//# sourceMappingURL=follow.controller.js.map