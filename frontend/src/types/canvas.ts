export interface Point {
  x: number;
  y: number;
}
export interface BaseShape {
  id: string;
}
export interface PolygonShape extends BaseShape {
  type: "polygon";
  name: string;
  points: Point[];
  area: number;
  geojson: unknown;
}
export interface FrameShape extends BaseShape {
  type: "frame";
  x: number;
  y: number;
  width: number;
  height: number;
}
export type Shape = PolygonShape | FrameShape;
export type Tool = "select" | "polygon" | "frame";
