import { Router } from "express";
import { PostsController } from "../controllers/posts.controller.js";
import { authenticate } from "../middlewares/authenticate.js";

export const router = Router();

router.post("/create", authenticate, PostsController.createPost);

router.get("/", authenticate, PostsController.getPosts);
router.get("/:id", authenticate, PostsController.getPostById);