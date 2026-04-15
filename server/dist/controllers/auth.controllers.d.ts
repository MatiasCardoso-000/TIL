import type { Request, Response } from "express";
import type { User } from "../types/types.js";
export declare const AuthControllers: {
    register: (req: Request, res: Response) => Promise<Response>;
    login: (req: Request, res: Response) => Promise<Response>;
    logout: (req: Request, res: Response) => Promise<Response>;
    update: (req: Request, res: Response) => Promise<Response<User>>;
    refreshToken: (req: Request, res: Response) => Promise<Response>;
    me: (req: Request, res: Response) => Promise<Response<User>>;
};
//# sourceMappingURL=auth.controllers.d.ts.map