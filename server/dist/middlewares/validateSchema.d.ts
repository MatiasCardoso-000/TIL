import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";
export declare const validateSchema: (schema: ZodType) => (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
//# sourceMappingURL=validateSchema.d.ts.map