import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  Stage,
  Layer,
  Line,
  Circle,
  Rect,
  Group,
  Text,
  Transformer,
} from "react-konva";
import type Konva from "konva";
import type { KonvaEventObject } from "konva/lib/Node";
import * as turf from "@turf/turf";
import { Trash2 } from "lucide-react";

import type { Point, Shape, PolygonShape, Tool } from "../types/canvas";
import { CanvasToolbar } from "./canvas/CanvasToolbar";
import { CanvasPropertiesPanel } from "./canvas/CanvasPropertiesPanel";
import type { Project } from "../types/project";

const MIN_SCALE = 0.1;
const MAX_SCALE = 5;
const GRID_SIZE = 50;
export const SCALE_TURF = 0.00001;

interface SketchCanvasProps {
  onSketchComplete: (geojson: unknown, area: number) => void;
  project?: Project | null;
}
export interface SketchCanvasRef {
  getShapes: () => Shape[];
  getThumbnail: () => string | undefined;
}

export const SketchCanvas = React.forwardRef<
  SketchCanvasRef,
  SketchCanvasProps
>(({ onSketchComplete, project }, ref) => {
  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const trRef = useRef<Konva.Transformer>(null);

  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const [tool, setTool] = useState<Tool>("select");
  const [shapes, setShapes] = useState<Shape[]>([]);

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [activePoints, setActivePoints] = useState<Point[]>([]);
  const [activeFrame, setActiveFrame] = useState<{
    x: number;
    y: number;
    w: number;
    h: number;
  } | null>(null);
  const [mousePos, setMousePos] = useState<Point | null>(null);
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);
  React.useImperativeHandle(ref, () => ({
    getShapes: () => shapes,
    getThumbnail: () => stageRef.current?.toDataURL({ pixelRatio: 0.5 }),
  }));

  useEffect(() => {
    const setInitStage = () => {
      if (project && Array.isArray(project.canvas_state)) {
        setShapes(project.canvas_state);
      }
    };
    setInitStage();
  }, [project]);
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

  useEffect(() => {
    if (!selectedId || !stageRef.current) {
      (() => setMenuPos(null))();
      trRef.current?.nodes([]);
      return;
    }
    const stage = stageRef.current;
    const node = stage.findOne(`#${selectedId}`);

    // Attach transformer to selected frames
    const shape = shapes.find((s) => s.id === selectedId);
    if (shape && shape.type === "frame" && node && trRef.current) {
      trRef.current.nodes([node]);
      trRef.current.getLayer()?.batchDraw();
    } else {
      trRef.current?.nodes([]);
    }

    if (node) {
      const box = node.getClientRect();
      setMenuPos({ x: box.x + box.width / 2, y: box.y - 45 });
    } else {
      setMenuPos(null);
    }
  }, [selectedId, scale, position, shapes]);

  const handleWheel = useCallback((e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition()!;
    const direction = e.evt.deltaY > 0 ? -1 : 1;
    const factor = 1.08;
    const newScale = direction > 0 ? oldScale * factor : oldScale / factor;
    const clampedScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScale));

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };
    const newPos = {
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale,
    };

    setScale(clampedScale);
    setPosition(newPos);
  }, []);

  const handleStageClick = (e: KonvaEventObject<MouseEvent>) => {
    if (tool === "select") {
      if (e.target === e.target.getStage()) {
        setSelectedId(null);
      }
      return;
    }

    const stage = stageRef.current;
    if (!stage) return;
    const pointer = stage.getPointerPosition()!;
    const worldPoint = {
      x: (pointer.x - position.x) / scale,
      y: (pointer.y - position.y) / scale,
    };

    if (
      tool === "polygon" &&
      activePoints.length > 0 &&
      (e.evt.ctrlKey || e.evt.shiftKey || e.evt.metaKey)
    ) {
      const lastPt = activePoints[activePoints.length - 1];
      if (
        Math.abs(worldPoint.x - lastPt.x) > Math.abs(worldPoint.y - lastPt.y)
      ) {
        worldPoint.y = lastPt.y;
      } else {
        worldPoint.x = lastPt.x;
      }
    }

    if (tool === "polygon") {
      if (activePoints.length >= 3) {
        const first = activePoints[0];
        const dist = Math.hypot(first.x - worldPoint.x, first.y - worldPoint.y);
        if (dist < 15 / scale) {
          const coordinates = [...activePoints, activePoints[0]].map((p) => [
            p.x * SCALE_TURF,
            -(p.y * SCALE_TURF),
          ]);
          const polygon = turf.polygon([[...coordinates]]);
          const area = turf.area(polygon);

          setShapes([
            ...shapes,
            {
              id: `poly-${Date.now()}`,
              type: "polygon",
              name: "New Space",
              points: activePoints,
              area,
              geojson: polygon.geometry,
            },
          ]);
          setActivePoints([]);
          setTool("select");
          onSketchComplete(polygon.geometry, Math.round(area));
          return;
        }
      }
      setActivePoints([...activePoints, worldPoint]);
    }
  };

  const handleMouseDown = (e: KonvaEventObject<MouseEvent>) => {
    if (tool !== "frame") return;
    if (e.evt.button === 1) return;

    if (e.target.getParent()?.className === "Transformer") return;

    const stage = stageRef.current!;
    const pointer = stage.getPointerPosition()!;
    const worldPoint = {
      x: (pointer.x - position.x) / scale,
      y: (pointer.y - position.y) / scale,
    };
    setActiveFrame({ x: worldPoint.x, y: worldPoint.y, w: 0, h: 0 });
  };

  const handleMouseMove = (e: KonvaEventObject<MouseEvent>) => {
    const stage = stageRef.current!;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const worldPoint = {
      x: (pointer.x - position.x) / scale,
      y: (pointer.y - position.y) / scale,
    };

    if (
      tool === "polygon" &&
      activePoints.length > 0 &&
      (e.evt.ctrlKey || e.evt.shiftKey || e.evt.metaKey)
    ) {
      const lastPt = activePoints[activePoints.length - 1];
      if (
        Math.abs(worldPoint.x - lastPt.x) > Math.abs(worldPoint.y - lastPt.y)
      ) {
        worldPoint.y = lastPt.y;
      } else {
        worldPoint.x = lastPt.x;
      }
    }

    setMousePos(worldPoint);

    if (tool === "frame" && activeFrame) {
      setActiveFrame({
        ...activeFrame,
        w: worldPoint.x - activeFrame.x,
        h: worldPoint.y - activeFrame.y,
      });
    }
  };

  const handleMouseUp = () => {
    if (tool === "frame" && activeFrame) {
      const rectX =
        activeFrame.w < 0 ? activeFrame.x + activeFrame.w : activeFrame.x;
      const rectY =
        activeFrame.h < 0 ? activeFrame.y + activeFrame.h : activeFrame.y;
      const width = Math.abs(activeFrame.w);
      const height = Math.abs(activeFrame.h);
      if (width > 20 && height > 20) {
        setShapes([
          ...shapes,
          {
            id: `frame-${Date.now()}`,
            type: "frame",
            x: rectX,
            y: rectY,
            width,
            height,
          },
        ]);
      }
      setActiveFrame(null);
      setTool("select");
    }
  };

  const deleteShape = () => {
    if (selectedId) {
      setShapes(shapes.filter((s) => s.id !== selectedId));
      setSelectedId(null);
    }
  };

  const handleNameUpdate = (shapeId: string, newName: string) => {
    setShapes(
      shapes.map((s) =>
        s.id === shapeId && s.type === "polygon" ? { ...s, name: newName } : s,
      ),
    );
  };

  const handleEdgeManualUpdate = (
    shapeId: string,
    edgeIndex: number,
    newLenMeters: number,
  ) => {
    const shape = shapes.find((s) => s.id === shapeId) as
      | PolygonShape
      | undefined;
    if (!shape) return;

    const points = [...shape.points];
    const p1 = points[edgeIndex];
    const nextIdx = (edgeIndex + 1) % points.length;
    const p2 = points[nextIdx];

    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const currentPixels = Math.hypot(dx, dy);

    const currentMeters = turf.distance(
      [p1.x * SCALE_TURF, -(p1.y * SCALE_TURF)],
      [p2.x * SCALE_TURF, -(p2.y * SCALE_TURF)],
      { units: "meters" },
    );

    if (currentMeters <= 0.01 || isNaN(newLenMeters) || newLenMeters <= 0)
      return;

    const scaleRatio = newLenMeters / currentMeters;
    const newPixels = currentPixels * scaleRatio;

    const angle = Math.atan2(dy, dx);
    const newP2x = p1.x + Math.cos(angle) * newPixels;
    const newP2y = p1.y + Math.sin(angle) * newPixels;

    const deltaX = newP2x - p2.x;
    const deltaY = newP2y - p2.y;

    for (let i = 1; i < points.length; i++) {
      const idx = (edgeIndex + i) % points.length;
      if (idx === edgeIndex) continue;
      points[idx] = { x: points[idx].x + deltaX, y: points[idx].y + deltaY };
    }

    const coordinates = [...points, points[0]].map((p) => [
      p.x * SCALE_TURF,
      -(p.y * SCALE_TURF),
    ]);
    const polygon = turf.polygon([[...coordinates]]);

    setShapes(
      shapes.map((s) =>
        s.id === shapeId
          ? {
              ...s,
              points,
              area: turf.area(polygon),
              geojson: polygon.geometry,
            }
          : s,
      ) as Shape[],
    );
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

  const selectedShapeObj = shapes.find((s) => s.id === selectedId);

  return (
    <div className="relative h-full w-full flex flex-col font-sans overflow-hidden">
      <CanvasToolbar
        tool={tool}
        setTool={setTool}
        clearActivePoints={() => setActivePoints([])}
        clearSelectedId={() => setSelectedId(null)}
      />

      <CanvasPropertiesPanel
        selectedShapeObj={selectedShapeObj}
        setSelectedId={setSelectedId}
        SCALE_TURF={SCALE_TURF}
        handleEdgeManualUpdate={handleEdgeManualUpdate}
        deleteShape={deleteShape}
        onNameUpdate={handleNameUpdate}
      />

      {menuPos && selectedShapeObj?.type !== "polygon" && (
        <div
          className="absolute z-20 bg-gray-900 text-white shadow-xl flex items-center px-1.5 py-1.5 rounded-lg transform -translate-x-1/2"
          style={{ left: menuPos.x, top: menuPos.y }}
        >
          <button
            onClick={deleteShape}
            className="p-1 hover:text-red-400 hover:bg-gray-700 rounded-md transition-colors"
            title="Delete"
          >
            <Trash2 size={18} />
          </button>
        </div>
      )}

      <div
        ref={containerRef}
        style={gridStyle}
        className={`flex-1 ${tool === "select" ? "cursor-default" : "cursor-crosshair"}`}
      >
        <Stage
          ref={stageRef}
          width={stageSize.width}
          height={stageSize.height}
          scaleX={scale}
          scaleY={scale}
          x={position.x}
          y={position.y}
          draggable={tool === "select"}
          onWheel={handleWheel}
          onDragEnd={(e) => {
            if (e.target === stageRef.current)
              setPosition({ x: e.target.x(), y: e.target.y() });
          }}
          onClick={handleStageClick}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          <Layer>
            {shapes.map((shape) => {
              const isSelected = shape.id === selectedId;

              if (shape.type === "frame") {
                return (
                  <Rect
                    key={shape.id}
                    id={shape.id}
                    x={shape.x}
                    y={shape.y}
                    width={shape.width}
                    height={shape.height}
                    fill="white"
                    stroke={isSelected ? "#3b82f6" : "#cbd5e1"}
                    strokeWidth={(isSelected ? 3 : 1.5) / scale}
                    shadowColor="black"
                    shadowBlur={isSelected ? 10 : 0}
                    shadowOpacity={0.1}
                    draggable={tool === "select" && isSelected}
                    onClick={(e) => {
                      if (tool === "select") {
                        e.cancelBubble = true;
                        setSelectedId(shape.id);
                      }
                    }}
                    onDragStart={(e) => {
                      if (tool === "select") {
                        e.cancelBubble = true;
                        setSelectedId(shape.id);
                      }
                    }}
                    onDragEnd={(e) => {
                      const updatedShapes = shapes.map((s) =>
                        s.id === shape.id
                          ? { ...s, x: e.target.x(), y: e.target.y() }
                          : s,
                      ) as Shape[];
                      setShapes(updatedShapes);
                    }}
                    onTransformEnd={(e) => {
                      const node = e.target;
                      const scaleX = node.scaleX();
                      const scaleY = node.scaleY();
                      node.scaleX(1);
                      node.scaleY(1);
                      const updatedShapes = shapes.map((s) =>
                        s.id === shape.id
                          ? {
                              ...s,
                              x: node.x(),
                              y: node.y(),
                              width: Math.max(5, node.width() * scaleX),
                              height: Math.max(5, node.height() * scaleY),
                            }
                          : s,
                      ) as Shape[];
                      setShapes(updatedShapes);
                    }}
                  />
                );
              }

              if (shape.type === "polygon") {
                const flat = shape.points.flatMap((p) => [p.x, p.y]);

                // Calculate visual center of mass for the text
                let cx = 0,
                  cy = 0;
                shape.points.forEach((p) => {
                  cx += p.x;
                  cy += p.y;
                });
                cx /= shape.points.length;
                cy /= shape.points.length;

                return (
                  <Group
                    key={shape.id}
                    id={shape.id}
                    onClick={(e) => {
                      if (tool === "select") {
                        e.cancelBubble = true;
                        setSelectedId(shape.id);
                      }
                    }}
                    draggable={tool === "select" && isSelected}
                    onDragStart={(e) => {
                      if (tool === "select") {
                        e.cancelBubble = true;
                        setSelectedId(shape.id);
                      }
                    }}
                    onDragEnd={(e) => {
                      const node = e.target;
                      const dx = node.x();
                      const dy = node.y();

                      node.x(0);
                      node.y(0);

                      const updatedShapes = shapes.map((s) => {
                        if (s.id === shape.id && s.type === "polygon") {
                          const newPoints = s.points.map((p) => ({
                            x: p.x + dx,
                            y: p.y + dy,
                          }));
                          const coordinates = [...newPoints, newPoints[0]].map(
                            (p) => [p.x * SCALE_TURF, -(p.y * SCALE_TURF)],
                          );
                          const polygon = turf.polygon([[...coordinates]]);

                          return {
                            ...s,
                            points: newPoints,
                            area: turf.area(polygon),
                            geojson: polygon.geometry,
                          };
                        }
                        return s;
                      }) as Shape[];
                      setShapes(updatedShapes);
                    }}
                  >
                    <Line
                      points={flat}
                      closed
                      fill={
                        isSelected
                          ? "rgba(59,130,246,0.3)"
                          : "rgba(59,130,246,0.15)"
                      }
                      stroke={isSelected ? "#2563eb" : "#3b82f6"}
                      strokeWidth={(isSelected ? 4 : 2) / scale}
                    />

                    {scale > 0.5 && (
                      <Text
                        x={cx - 100 / scale}
                        y={cy - 10 / scale}
                        width={200 / scale}
                        text={shape.name}
                        fontSize={16 / scale}
                        align="center"
                        fill="#1e3a8a"
                        fontStyle="bold"
                      />
                    )}

                    {shape.points.map((pt, i) => {
                      const nextPt =
                        shape.points[(i + 1) % shape.points.length];
                      const dMeters = turf.distance(
                        [pt.x * SCALE_TURF, -(pt.y * SCALE_TURF)],
                        [nextPt.x * SCALE_TURF, -(nextPt.y * SCALE_TURF)],
                        { units: "meters" },
                      );
                      const midX = (pt.x + nextPt.x) / 2;
                      const midY = (pt.y + nextPt.y) / 2;
                      if (scale < 0.6 && !isSelected) return null;
                      return (
                        <Group key={i}>
                          <Rect
                            x={midX - 22 / scale}
                            y={midY - 10 / scale}
                            width={44 / scale}
                            height={20 / scale}
                            fill="white"
                            cornerRadius={4 / scale}
                            opacity={0.8}
                          />
                          <Text
                            x={midX - 22 / scale}
                            y={midY - 5 / scale}
                            width={44 / scale}
                            text={`${dMeters.toFixed(1)}m`}
                            fontSize={10 / scale}
                            align="center"
                            fill="#1e40af"
                            fontStyle="bold"
                          />
                        </Group>
                      );
                    })}
                  </Group>
                );
              }
              return null;
            })}

            {selectedShapeObj?.type === "frame" && tool === "select" && (
              <Transformer
                ref={trRef}
                boundBoxFunc={(oldBox, newBox) =>
                  newBox.width < 10 || newBox.height < 10 ? oldBox : newBox
                }
                ignoreStroke
                borderStroke="#3b82f6"
                anchorStroke="#3b82f6"
                anchorFill="white"
                anchorSize={10 / scale}
                borderStrokeWidth={2 / scale}
              />
            )}

            {activeFrame && (
              <Rect
                x={
                  activeFrame.w < 0
                    ? activeFrame.x + activeFrame.w
                    : activeFrame.x
                }
                y={
                  activeFrame.h < 0
                    ? activeFrame.y + activeFrame.h
                    : activeFrame.y
                }
                width={Math.abs(activeFrame.w)}
                height={Math.abs(activeFrame.h)}
                stroke="#3b82f6"
                strokeWidth={2 / scale}
                dash={[5 / scale, 5 / scale]}
                fill="rgba(59,130,246,0.1)"
              />
            )}

            {activePoints.length > 0 && (
              <Group>
                <Line
                  points={activePoints.flatMap((p) => [p.x, p.y])}
                  stroke="#3b82f6"
                  strokeWidth={2 / scale}
                />
                {mousePos &&
                  (() => {
                    const lastPt = activePoints[activePoints.length - 1];
                    const dMeters = turf.distance(
                      [lastPt.x * SCALE_TURF, -(lastPt.y * SCALE_TURF)],
                      [mousePos.x * SCALE_TURF, -(mousePos.y * SCALE_TURF)],
                      { units: "meters" },
                    );
                    const midX = (lastPt.x + mousePos.x) / 2;
                    const midY = (lastPt.y + mousePos.y) / 2;
                    return (
                      <Group>
                        <Line
                          points={[lastPt.x, lastPt.y, mousePos.x, mousePos.y]}
                          stroke="#9ca3af"
                          strokeWidth={1.5 / scale}
                          dash={[6 / scale, 4 / scale]}
                        />
                        <Rect
                          x={midX - 25 / scale}
                          y={midY - 10 / scale}
                          width={50 / scale}
                          height={20 / scale}
                          fill="white"
                          cornerRadius={4 / scale}
                          opacity={0.8}
                        />
                        <Text
                          x={midX - 25 / scale}
                          y={midY - 6 / scale}
                          width={50 / scale}
                          text={`${dMeters.toFixed(1)}m`}
                          fontSize={10 / scale}
                          align="center"
                          fill="#3b82f6"
                          fontStyle="bold"
                        />
                      </Group>
                    );
                  })()}
                <Circle
                  x={activePoints[0].x}
                  y={activePoints[0].y}
                  radius={12 / scale}
                  stroke="#ef4444"
                  strokeWidth={2 / scale}
                />
                {activePoints.map((p, i) => (
                  <Circle
                    key={i}
                    x={p.x}
                    y={p.y}
                    radius={5 / scale}
                    fill="#2563eb"
                  />
                ))}
              </Group>
            )}
          </Layer>
        </Stage>
      </div>
    </div>
  );
});
