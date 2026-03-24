import type { NextFunction, Request, Response } from "express";
import type {  ZodType } from "zod";

export const validateSchema =
  (schema: ZodType) => (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.body);

      if (!result.success) {
        return res
          .status(400)
          .json({ errors: result.error.flatten().fieldErrors });
      }
      return next();
    } catch (error) {
      return res.status(500).json({ errors: ["Internal server error"] });
    }
  };
