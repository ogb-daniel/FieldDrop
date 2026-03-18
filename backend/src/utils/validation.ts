import z from "zod";

export const SketchSchema = z.object({
  name: z.string(),
  area: z.string(),
  geojson: z.string(),
  projectId: z.uuid(),
});
export const NearbySketchSchema = z.object({
  lng: z.string(),
  lat: z.string(),
  radius: z.number().optional(),
});
export const OfflineSketchSchema = z.object({
  sketches: z.array(SketchSchema).min(1),
});
export const CreateProjectSchema = z.object({
  name: z.string().optional(),
});

export const GetProjectSchema = z.object({
  id: z.uuid(),
});

export type SketchInput = z.infer<typeof SketchSchema>;
export type NearbySketch = z.infer<typeof NearbySketchSchema>;
export type OfflineSketchInput = z.infer<typeof OfflineSketchSchema>;
export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;
export type GetProjectInput = z.infer<typeof GetProjectSchema>;
