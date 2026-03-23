import { Router } from "express";
import { PostsController } from "../controllers/posts.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { validateSchema } from "../middlewares/validateSchema.js";
import { createPostSchema, updatePostSchema } from "../schemas/post.schema.js";

export const router = Router();

router.post(
  "/",
  authenticate,
  validateSchema(createPostSchema),
  PostsController.createPost,
);

router.get("/", authenticate, PostsController.getPosts);
router.get("/:id", authenticate, PostsController.getPostById);
router.patch(
  "/:id",
  authenticate,
  validateSchema(updatePostSchema),
  PostsController.updatePost,
);
router.delete("/:id", authenticate, PostsController.deletePost);
