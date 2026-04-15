import type { Request, Response } from "express";
export declare const FollowController: {
    follow: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    unfollow: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    getFollowers: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    getFollowing: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
};
//# sourceMappingURL=follow.controller.d.ts.map