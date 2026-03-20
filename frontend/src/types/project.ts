import type { Shape } from "./canvas";

export type Project = {
  id: string;
  name: string;
  sketches: [];
  canvas_state: Shape[];
  thumbnail: string | undefined;
};
