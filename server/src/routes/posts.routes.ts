import { Router } from "express";
import { PostsController } from "../controllers/posts.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { validateSchema } from "../middlewares/validateSchema.js";
import { createPostSchema, updatePostSchema } from "../schemas/post.schema.js";
import rateLimit from "express-rate-limit";

export const router = Router();

const postLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { message: "Demasiados intentos, espera 15 minutos" },
});

router.post(
  "/",
  authenticate,
  postLimiter,
  validateSchema(createPostSchema),
  PostsController.createPost,
);

router.get("/", authenticate, PostsController.getPosts);
router.get("/:id", authenticate, PostsController.getPostById);
router.put(
  "/:id",
  authenticate,
  validateSchema(updatePostSchema),
  PostsController.updatePost,
);
router.delete("/:id", authenticate, PostsController.deletePost);
