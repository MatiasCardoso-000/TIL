import { Router } from "express";
import { AuthControllers } from "../controllers/auth.controllers.js";
import { validateSchema } from "../middlewares/validateSchema.js";
import { loginSchema, registerSchema } from "../schemas/auth.schemas.js";
import { authenticate } from "../middlewares/authenticate.js";
import rateLimit from "express-rate-limit";

export const router = Router();

// const authLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutos
//   max: 10,
//   message: { message: "Demasiados intentos, esperá 15 minutos" },
// });

router.post(
  "/register",
  validateSchema(registerSchema),
  AuthControllers.register,
);
router.post("/login", validateSchema(loginSchema), AuthControllers.login);
router.post("/logout",authenticate, AuthControllers.logout);
router.post("/refresh-token", AuthControllers.refreshToken);
router.get("/me", authenticate, AuthControllers.me);
