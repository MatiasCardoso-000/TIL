export type payloadType = {
  userId: string;
};

export type JwtDecoded = {
  payload: payloadType;
  iat: number;
  exp: number;
};

export interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl: true;
  bio: true;
  createdAt: true;
}

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}
