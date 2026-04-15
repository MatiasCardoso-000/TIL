import { z } from "zod";
export declare const loginSchema: z.ZodObject<{
    email: z.ZodPipe<z.ZodString, z.ZodEmail>;
    password: z.ZodString;
}, z.core.$strip>;
export declare const registerSchema: z.ZodObject<{
    username: z.ZodString;
    email: z.ZodPipe<z.ZodString, z.ZodEmail>;
    password: z.ZodString;
    confirmPassword: z.ZodString;
}, z.core.$strip>;
export declare const updateUserSchema: z.ZodObject<{
    username: z.ZodString;
    email: z.ZodPipe<z.ZodString, z.ZodEmail>;
    bio: z.ZodOptional<z.ZodString>;
    avatarUrl: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type UpdateInput = z.infer<typeof updateUserSchema>;
//# sourceMappingURL=auth.schemas.d.ts.map