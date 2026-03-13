import { Router } from "express";
import { AuthControllers } from "../controllers/auth.controllers.js";
import { validateSchema } from "../middlewares/validateSchema.js";
import { loginSchema, registerSchema } from "../schemas/auth.schemas.js";
import { authenticate } from "../middlewares/authenticate.js";

export const router = Router();

router.post(
  "/register",
  validateSchema(registerSchema),
  AuthControllers.register,
);
router.post("/login", validateSchema(loginSchema), AuthControllers.login);
router.post("/logout",  AuthControllers.logout);
router.post("/refresh-token", AuthControllers.refreshToken);
router.get("/me", authenticate, AuthControllers.me);
