import express from "express";
import cors from "cors";
import { router as AuthRoutes } from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";
import helmet from "helmet";


const app = express();
app.use(helmet())
app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use("/api", AuthRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
