import type { Request, Response } from "express";
export declare const PostsController: {
    createPost: (req: Request, res: Response) => Promise<Response>;
    getPosts: (req: Request, res: Response) => Promise<Response>;
    getPostById: (req: Request, res: Response) => Promise<Response>;
    updatePost: (req: Request, res: Response) => Promise<Response>;
    deletePost: (req: Request, res: Response) => Promise<Response>;
};
//# sourceMappingURL=posts.controller.d.ts.map