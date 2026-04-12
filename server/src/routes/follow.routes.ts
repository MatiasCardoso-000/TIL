import { Router } from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { FollowController } from "../controllers/follow.controller.js";

export const router = Router();

// Follow a user
router.post("/:userId", authenticate, FollowController.follow);

// Unfollow a user
router.delete("/:userId", authenticate, FollowController.unfollow);

// Get followers of a user
router.get("/followers/:userId", authenticate, FollowController.getFollowers);

// Get following of a user
router.get("/following/:userId", authenticate, FollowController.getFollowing);
