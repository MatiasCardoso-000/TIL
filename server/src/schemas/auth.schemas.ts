// src/schemas/auth.schema.ts
import { z } from "zod";

// ─────────────────────────────────────────
// Regex de contraseña
// ─────────────────────────────────────────
const passwordRegex =
  /^(?=.*[A-ZÁÉÍÓÚÑ])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-záéíóúüñÁÉÍÓÚÜÑ\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,}$/;

const passwordSchema = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres.")
  .regex(passwordRegex, {
    error:
      "Debe tener al menos una mayúscula (permite Ñ), un número y un carácter especial.",
  });

// ─────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────
export const loginSchema = z.object({
  email: z
    .string({ error: "El email es requerido" })
    .min(1, "El email es requerido")
    .pipe(z.email("El email no es válido")), // ✅ .pipe() para controlar orden de validación

  password: z.string().min(1, "La contraseña es requerida"),
});

// ─────────────────────────────────────────
// REGISTER
// ─────────────────────────────────────────
export const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, "El usuario debe tener al menos 3 caracteres.")
      .max(20, "El usuario no puede tener más de 20 caracteres.")
      .regex(
        /^[a-zA-Z0-9áéíóúüñÁÉÍÓÚÜÑ_]+$/,
        "Solo puede contener letras, números y guión bajo.",
      ),

    email: z
      .string({ error: "El email es requerido." })
      .min(1, "El email es requerido.")
      .pipe(z.email("El email no es válido.")), // ✅ Zod v4

    password: passwordSchema,

    confirmPassword: z.string().min(1, "Debes confirmar la contraseña."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  });

export const updateUserSchema = z.object({
  username: z
    .string()
    .min(3, "El usuario debe tener al menos 3 caracteres.")
    .max(20, "El usuario no puede tener más de 20 caracteres.")
    .regex(
      /^[a-zA-Z0-9áéíóúüñÁÉÍÓÚÜÑ_]+$/,
      "Solo puede contener letras, números y guión bajo.",
    ),
  email: z
    .string({ error: "El email es requerido." })
    .min(1, "El email es requerido.")
    .pipe(z.email("El email no es válido.")),
  bio: z.string().optional(),
  avatarUrl: z.string().optional(),
});
// ─────────────────────────────────────────
// Tipos inferidos
// ─────────────────────────────────────────
//Genera automaticamente un tipo basado en el schema de zod
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type UpdateInput = z.infer<typeof updateUserSchema>