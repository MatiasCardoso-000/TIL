export type payloadType = {
  userId: string;
};

export type JwtDecoded = {
  payload: payloadType;
  iat: number;
  exp: number;
};

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}
