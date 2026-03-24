import type { Request, Response } from "express";
import type { LoginInput } from "../schemas/auth.schemas.js";
import bcrypt from "bcryptjs";
import prisma from "../lib/prisma.js";
import type { RegisterInput } from "../schemas/auth.schemas.js";
import { createToken } from "../utils/createToken.js";
import jwt from "jsonwebtoken";
import type { JwtDecoded } from "../types/types.js";
import { refreshCookieOptions } from "../utils/cookieOptions.js";
import { Prisma } from "../generated/client.js";
import { hashToken } from "../utils/hashToken.js";

// ------------------------------------------------------------- //
// ------------------------------------------------------------- //
// ------------------------------------------------------------- //

const register = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { username, email, password } = req.body as RegisterInput;

    //Hashear la contraseña

    const hashedPassword = await bcrypt.hash(password, 12);

    //Crear el usuario en la BD

    let user;
    try {
      user = await prisma.user.create({
        data: { username, email, password: hashedPassword },
        select: { id: true, username: true, email: true, createdAt: true },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        const field = (error.meta?.target as string[])?.includes("email")
          ? "email"
          : "username";
        return res
          .status(409)
          .json({ message: `Este ${field} ya está en uso` });
      }
      throw error;
    }
    //Generar JWT

    const { accessToken, refreshToken } = createToken({
      userId: user.id,
    });

    const hashedToken = hashToken(refreshToken);

    await prisma.refreshToken.create({
      data: {
        hashedToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    res.cookie("refreshToken", refreshToken, refreshCookieOptions);

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

const DUMMY_HASH =
  "$2b$12$UrDHzF6/qT03Cb5KRLPIW.SGLaf7Uq.DSc2TpVFasa9fbVXL/MyZW";

const login = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email, password } = req.body as LoginInput;

    const userFound = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (!userFound) {
      await bcrypt.compare(password, DUMMY_HASH);

      return res.status(401).json({ message: "Invalid credentials" });
    }

    const passwordMatch = await bcrypt.compare(password, userFound.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const { accessToken, refreshToken } = createToken({
      userId: userFound.id,
    });

    const hashedToken = hashToken(refreshToken);

    await prisma.refreshToken.create({
      data: {
        hashedToken,
        userId: userFound.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    res.cookie("refreshToken", refreshToken, refreshCookieOptions);

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

const logout = async (req: Request, res: Response): Promise<Response> => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token" });
    }

    const hashedToken = hashToken(refreshToken);

    await prisma.refreshToken.update({
      where: {
        hashedToken,
      },
      data: {
        isRevoked: true,
      },
    });

    res.clearCookie("refreshToken", refreshCookieOptions);

    return res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    console.error("[LOGOUT ERROR]", error);
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

    const tokenInDb = await prisma.refreshToken.findUnique({
      where: {
        hashedToken: hashToken(token),
        isRevoked: false,
      },
    });

    if (!tokenInDb || tokenInDb.isRevoked || tokenInDb.expiresAt < new Date()) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const { accessToken, refreshToken } = createToken({
      userId: decoded.payload.userId,
    });

    const hashedNew = hashToken(refreshToken);

    await Promise.all([
      prisma.refreshToken.update({
        where: {
          id: tokenInDb.id,
        },
        data: {
          isRevoked: true,
        },
      }),
      prisma.refreshToken.create({
        data: {
          hashedToken: hashedNew,
          userId: tokenInDb.userId,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      }),
    ]);

    await prisma.refreshToken.deleteMany({
      where: {
        userId: tokenInDb.userId,
        OR: [
          { isRevoked: true },
          {
            expiresAt: {
              // lt = less than
              lt: new Date(),
            },
          },
        ],
      },
    });
    res.cookie("refreshToken", refreshToken, refreshCookieOptions);

    return res.status(200).json({ accessToken });
  } catch (error) {
    console.error("[REFRESH TOKEN ERROR]",error);
    
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
