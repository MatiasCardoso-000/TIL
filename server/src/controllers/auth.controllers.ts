import type { Request, Response } from "express";
import type { LoginInput } from "../schemas/auth.schemas.js";
import bcrypt from "bcryptjs";
import prisma from "../lib/prisma.js";
import type { RegisterInput } from "../schemas/auth.schemas.js";
import { createToken } from "../utils/createToken.js";
import jwt from "jsonwebtoken";
import type { JwtDecoded } from "../types/types.js";

// ------------------------------------------------------------- //
// ------------------------------------------------------------- //
// ------------------------------------------------------------- //

const register = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { username, email, password } = req.body as RegisterInput;

    //Verificar si el email ya existe
    const emailExists = await prisma.user.findUnique({
      where: { email },
    });

    if (emailExists) {
      return res.status(409).json({
        errors: { message: "Este email ya está registrado" },
      });
    }

    //Verificar si username existe

    const usernameExists = await prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (usernameExists) {
      return res.status(409).json({
        errors: { message: "Este nombre de usuario ya está en uso" },
      });
    }

    //Hashear la contraseña

    const hashedPassword = await bcrypt.hash(password, 12);

    //Crear el usuario en la BD

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
      },
    });

    //Generar JWT

    const { accessToken, refreshToken } = await createToken({
      userId: user.id,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    //Responder con el usuario y el token

    return res.status(201).json({
      message: "User created successfully",
      user,
      accessToken,
    });
  } catch (error) {
    console.error("[REGISTER ERROR]", error);
    return res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};
// ------------------------------------------------------------- //
// ------------------------------------------------------------- //
// ------------------------------------------------------------- //
const login = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email, password } = req.body as LoginInput;

    const userFound = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (!userFound) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const passawordMatch = await bcrypt.compare(password, userFound.password);

    if (!passawordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const { accessToken, refreshToken } = await createToken({
      userId: userFound.id,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const user = {
      id: userFound.id,
      username: userFound.username,
      email: userFound.email,
    };

    return res.status(200).json({
      message: "User logged in",
      user,
      accessToken,
    });
  } catch (error) {
    console.error("[LOGIN ERROR]", error);
    return res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};

// ------------------------------------------------------------- //
// ------------------------------------------------------------- //
// ------------------------------------------------------------- //

const logout = async (_: Request, res: Response): Promise<Response> => {
  try {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    return res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    console.log("[LOGOUT ERROR]");
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// ------------------------------------------------------------- //
// ------------------------------------------------------------- //
// ------------------------------------------------------------- //

const refreshToken = async (req: Request, res: Response): Promise<Response> => {
  try {
    const token = req.cookies.refreshToken;

    if (!token) {
      return res.status(401).json({ message: "No refresh token" });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET!,
    ) as JwtDecoded;

    const { accessToken, refreshToken } = await createToken({
      userId: decoded.payload.userId,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({ accessToken });
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Invalid or expired refresh token" });
  }
};

const me = async (req: Request, res: Response): Promise<Response> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      select: {
        id: true,
        username: true,
        email: true,
        avatarUrl: true,
        bio: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error("[ME ERROR]", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const AuthControllers = {
  register,
  login,
  logout,
  refreshToken,
  me,
};
