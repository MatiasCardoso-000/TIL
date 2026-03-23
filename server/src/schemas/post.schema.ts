import { z } from "zod";

const CATEGORIES = [
  "TECNOLOGIA",
  "CIENCIA",
  "HISTORIA",
  "IDIOMAS",
  "MATEMATICAS",
  "ARTE",
  "SALUD",
  "NEGOCIOS",
  "OTRO",
];

const contentSchema = z
  .string({ error: "El contenido es requerido" })
  .min(10, "El contenido debe tener al menos 10 caracteres")
  .max(280, "El contenido no puede superar los 280 caracteres");

const categorySchema = z.enum(CATEGORIES, {
  error: "La categoria es requerida",
});

export const createPostSchema = z.object({
  content: contentSchema,
  category: categorySchema,
});

export const updatePostSchema = z.object({
  content: contentSchema.optional(),
  category: categorySchema.optional(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
