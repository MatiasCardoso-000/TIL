import jwt from "jsonwebtoken";
import type { payloadType } from "../types/types.js";

export const createToken = (payload: payloadType) => {
  if (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET) {
    throw new Error("Secret key for the token are not provided");
  }

  const accessToken = jwt.sign({ payload }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: "15m",
  });
  const refreshToken = jwt.sign({ payload }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });

  return {
    accessToken,
    refreshToken,
  };
};
