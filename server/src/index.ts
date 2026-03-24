import express from "express";

import type { Request, Response, NextFunction } from "express";
import cors from "cors";
import { router as AuthRoutes } from "./routes/auth.routes.js";
import { router as PostsRoutes } from "./routes/posts.routes.js";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import prisma from "./lib/prisma.js";

const app = express();
app.use(helmet());
app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

app.use("/api", AuthRoutes);
app.use("/api/posts", PostsRoutes);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(["ERROR HANDLING"], err);
  return res.status(500).json({ message: "Algo salió mal" });
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
