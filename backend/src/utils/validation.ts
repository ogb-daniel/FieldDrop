import z from "zod";

export const SketchSchema = z.object({
  name: z.string(),
  area: z.string(),
  geojson: z.string(),
});

export type SketchInput = z.infer<typeof SketchSchema>;
