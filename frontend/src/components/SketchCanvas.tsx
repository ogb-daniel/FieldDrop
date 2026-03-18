import type { KonvaEventObject } from "konva/lib/Node";
import type React from "react";
import { useMemo, useState } from "react";
import { Circle, Layer, Line, Stage } from "react-konva";
import * as turf from "@turf/turf";
interface Point {
  x: number;
  y: number;
}

interface SketchCanvasProps {
  onSketchComplete: (geojson: unknown, area: number) => void;
}
export const SketchCanvas: React.FC<SketchCanvasProps> = ({
  onSketchComplete,
}) => {
  const [points, setPoints] = useState<Point[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [mousePos, setMousePos] = useState<Point | null | undefined>(null);

  const handleStageClick = (e: KonvaEventObject<MouseEvent>) => {
    if (isFinished) return;

    const stage = e.target.getStage();
    const point = stage!.getPointerPosition()!;
    if (points.length >= 3) {
      const firstPoint = points[0];
      const dist = Math.hypot(firstPoint.x - point.x, firstPoint.y - point.y);
      if (dist < 20) {
        setIsFinished(true);
        calculateAndExport();
        return;
      }
    }
    setPoints([...points, point]);
  };

  const calculateAndExport = () => {
    if (points.length < 3) return;
    const SCALE = 0.00001;
    const coordinates = [...points, points[0]].map((p) => [
      p.x * SCALE,
      -(p.y * SCALE),
    ]);
    const polygon = turf.polygon([[...coordinates]]);
    const areaSqMeters = turf.area(polygon);
    onSketchComplete(polygon.geometry, areaSqMeters);
  };

  const flattenedPoints = useMemo(
    () => points.flatMap((p) => [p.x, p.y]),
    [points],
  );

  return (
    <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden cursor-crosshair">
      <Stage
        width={window.innerWidth > 800 ? 750 : window.innerWidth - 60}
        height={400}
        onClick={handleStageClick}
        onMouseMove={(e) => {
          const stage = e.target.getStage();
          setMousePos(stage?.getPointerPosition());
        }}
      >
        <Layer>
          <Line
            points={flattenedPoints}
            stroke="#3b82f6"
            strokeWidth={3}
            closed={isFinished}
            fill={isFinished ? "rgba(59, 130, 246, 0.2)" : undefined}
          />
          {!isFinished && points.length > 0 && mousePos && (
            <Line
              points={[
                points[points.length - 1].x,
                points[points.length - 1].y,
                mousePos.x,
                mousePos.y,
              ]}
              stroke="#9ca3af"
              strokeWidth={2}
              dash={[5, 5]}
            />
          )}
          {!isFinished && points.length >= 3 && (
            <Circle
              x={points[0].x}
              y={points[0].y}
              radius={10}
              stroke="#ef4444"
              strokeWidth={2}
            />
          )}

          {points.map((p, i) => (
            <Circle key={i} x={p.x} y={p.y} radius={5} fill="#2563eb" />
          ))}
        </Layer>
      </Stage>
      {isFinished && (
        <button
          className="w-full bg-red-50 py-3 text-red-600 font-medium hover:bg-red-100 transition-colors"
          onClick={() => {
            setPoints([]);
            setIsFinished(false);
          }}
        >
          Clear Sketch
        </button>
      )}
    </div>
  );
};
