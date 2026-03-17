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

export type SketchInput = z.infer<typeof SketchSchema>;
export type NearbySketch = z.infer<typeof NearbySketchSchema>;
