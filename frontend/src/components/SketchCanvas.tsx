import type { KonvaEventObject } from "konva/lib/Node";
import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Circle, Layer, Line, Stage } from "react-konva";
import * as turf from "@turf/turf";
import type Konva from "konva";
interface Point {
  x: number;
  y: number;
}
const MIN_SCALE = 0.1;
const MAX_SCALE = 5;
const GRID_SIZE = 50;
interface SketchCanvasProps {
  onSketchComplete: (geojson: unknown, area: number) => void;
}
export const SketchCanvas: React.FC<SketchCanvasProps> = ({
  onSketchComplete,
}) => {
  const [points, setPoints] = useState<Point[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [mousePos, setMousePos] = useState<Point | null | undefined>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const handleStageClick = (e: KonvaEventObject<MouseEvent>) => {
    if (isFinished) return;

    const stage = e.target.getStage();
    const point = stage!.getPointerPosition()!;
    const worldPoint: Point = {
      x: (point.x - position.x) / scale,
      y: (point.y - position.y) / scale,
    };
    if (points.length >= 3) {
      const firstPoint = points[0];
      const dist = Math.hypot(
        firstPoint.x - worldPoint.x,
        firstPoint.y - worldPoint.y,
      );
      if (dist < 15 / scale) {
        setIsFinished(true);
        calculateAndExport();
        return;
      }
    }
    setPoints([...points, worldPoint]);
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
  const handleWheel = useCallback((e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const stage: Konva.Stage | null = stageRef.current;
    if (!stage) return;

    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();

    const direction = e.evt.deltaY > 0 ? -1 : 1;
    const factor = 1.08;

    const newScale = direction > 0 ? oldScale * factor : oldScale / factor;

    const clampedScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScale));

    const mousePointTo = {
      x: (pointer!.x - stage.x()) / oldScale,
      y: (pointer!.y - stage.y()) / oldScale,
    };
    const newPos = {
      x: pointer!.x - mousePointTo.x * clampedScale,
      y: pointer!.y - mousePointTo.y * clampedScale,
    };

    setScale(clampedScale);
    setPosition(newPos);
  }, []);

  const handleDragEnd = () => {
    const stage = stageRef.current;
    if (!stage) return;
    setPosition({ x: stage.x(), y: stage.y() });
  };

  const gridStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    overflow: "hidden",
    backgroundColor: "#f8f9fa",
    backgroundImage: "radial-gradient(circle, #d0d0d0 1px, transparent 1px)",
    backgroundSize: `${GRID_SIZE * scale}px ${GRID_SIZE * scale}px`,
    backgroundPosition: `${position.x}px ${position.y}px`,
  };
  useEffect(() => {
    const resize = () => {
      if (containerRef.current) {
        setStageSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);
  return (
    <div
      ref={containerRef}
      style={gridStyle}
      className="bg-gray-100 border-2 border-dashed border-gray-300 overflow-hidden cursor-crosshair"
    >
      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        scaleX={scale}
        scaleY={scale}
        x={position.x}
        y={position.y}
        draggable
        onWheel={handleWheel}
        onDragEnd={handleDragEnd}
        onClick={handleStageClick}
        onMouseMove={(e) => {
          const stage = e.target.getStage();
          const pointer = stage?.getPointerPosition();
          if (pointer) {
            setMousePos({
              x: (pointer.x - position.x) / scale,
              y: (pointer.y - position.y) / scale,
            });
          }
        }}
      >
        <Layer>
          {/* Polygon outline */}
          <Line
            points={flattenedPoints}
            stroke="#3b82f6"
            strokeWidth={2 / scale}
            closed={isFinished}
            fill={isFinished ? "rgba(59,130,246,0.15)" : undefined}
          />
          {/* Rubber banding line to cursor */}
          {!isFinished && points.length > 0 && mousePos && (
            <Line
              points={[
                points[points.length - 1].x,
                points[points.length - 1].y,
                mousePos.x,
                mousePos.y,
              ]}
              stroke="#9ca3af"
              strokeWidth={1.5 / scale}
              dash={[6 / scale, 4 / scale]}
            />
          )}
          {!isFinished && points.length >= 3 && (
            <Circle
              x={points[0].x}
              y={points[0].y}
              radius={12 / scale}
              stroke="#ef4444"
              strokeWidth={2 / scale}
            />
          )}
          {points.map((p, i) => (
            <Circle key={i} x={p.x} y={p.y} radius={5 / scale} fill="#2563eb" />
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
