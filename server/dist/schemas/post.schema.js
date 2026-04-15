import { z } from "zod";
import { Category } from "../generated/enums.js";
const categorySchema = z.enum(Category, {
    error: "La categoria es requerida",
});
const contentSchema = z
    .string({ error: "El contenido es requerido" })
    .min(10, "El contenido debe tener al menos 10 caracteres")
    .max(280, "El contenido no puede superar los 280 caracteres");
export const createPostSchema = z.object({
    content: contentSchema,
    category: categorySchema,
});
export const updatePostSchema = z.object({
    content: contentSchema.optional(),
    category: categorySchema.optional(),
});
//# sourceMappingURL=post.schema.js.map