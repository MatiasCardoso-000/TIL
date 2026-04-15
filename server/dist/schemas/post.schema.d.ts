import { z } from "zod";
export declare const createPostSchema: z.ZodObject<{
    content: z.ZodString;
    category: z.ZodEnum<{
        readonly TECNOLOGIA: "TECNOLOGIA";
        readonly CIENCIA: "CIENCIA";
        readonly HISTORIA: "HISTORIA";
        readonly IDIOMAS: "IDIOMAS";
        readonly MATEMATICAS: "MATEMATICAS";
        readonly ARTE: "ARTE";
        readonly SALUD: "SALUD";
        readonly NEGOCIOS: "NEGOCIOS";
        readonly OTRO: "OTRO";
    }>;
}, z.core.$strip>;
export declare const updatePostSchema: z.ZodObject<{
    content: z.ZodOptional<z.ZodString>;
    category: z.ZodOptional<z.ZodEnum<{
        readonly TECNOLOGIA: "TECNOLOGIA";
        readonly CIENCIA: "CIENCIA";
        readonly HISTORIA: "HISTORIA";
        readonly IDIOMAS: "IDIOMAS";
        readonly MATEMATICAS: "MATEMATICAS";
        readonly ARTE: "ARTE";
        readonly SALUD: "SALUD";
        readonly NEGOCIOS: "NEGOCIOS";
        readonly OTRO: "OTRO";
    }>>;
}, z.core.$strip>;
export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
//# sourceMappingURL=post.schema.d.ts.map