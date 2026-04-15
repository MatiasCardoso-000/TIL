import { Router } from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { UsersController } from "../controllers/users.controller.js";

export const router = Router();

// Get suggested users to follow
router.get("/suggested", authenticate, UsersController.getSuggested);
router.get("/:userId",authenticate, UsersController.getUserProfile);
