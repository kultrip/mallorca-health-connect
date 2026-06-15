import { z } from "zod";

export const professionalsSearchSchema = z.object({
  q: z.string().optional(),
  municipio: z.string().optional(),
  modalidad: z.enum(["presencial", "online", "domicilio"]).optional(),
});

export type ProfessionalsSearch = z.infer<typeof professionalsSearchSchema>;

export const conversationalSearchSchema = z.object({ q: z.string().optional() });

export const onboardingSearchSchema = z.object({
  plan: z.enum(["presencia", "profesional", "centros-organizadores"]).optional(),
});
