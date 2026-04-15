import type { Request, Response } from "express";
import type { User } from "../types/types.js";
export declare const UsersController: {
    getSuggested: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    getUserProfile: (req: Request, res: Response) => Promise<Response<User>>;
};
//# sourceMappingURL=users.controller.d.ts.map