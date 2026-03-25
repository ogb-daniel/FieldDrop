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
export const UpdateProjectSchema = z.object({
  name: z.string().optional(),
  thumbnail: z.string().optional(),
  canvas_state: z.array(z.any()),
  polygons: z.array(z.any()),
});

export const GetProjectSchema = z.object({
  id: z.uuid(),
});

export type SketchInput = z.infer<typeof SketchSchema>;
export type NearbySketch = z.infer<typeof NearbySketchSchema>;
export type OfflineSketchInput = z.infer<typeof OfflineSketchSchema>;
export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;
export type GetProjectInput = z.infer<typeof GetProjectSchema>;
export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;
