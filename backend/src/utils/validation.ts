import z from "zod";

export const SketchSchema = z.object({
  name: z.string(),
  area: z.string(),
  geojson: z.string(),
});
export const NearbySketchSchema = z.object({
  lng: z.string(),
  lat: z.string(),
  radius: z.number().optional(),
});
export const OfflineSketchSchema = z.object({
  sketches: z.array(SketchSchema).min(1),
});

export type SketchInput = z.infer<typeof SketchSchema>;
export type NearbySketch = z.infer<typeof NearbySketchSchema>;
export type OfflineSketchInput = z.infer<typeof OfflineSketchSchema>;
