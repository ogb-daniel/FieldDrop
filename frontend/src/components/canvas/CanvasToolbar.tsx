import React from "react";
import { MousePointer2, Square, Hexagon } from "lucide-react";
import type { Tool } from "../../types/canvas";

interface CanvasToolbarProps {
  tool: Tool;
  setTool: (t: Tool) => void;
  clearActivePoints: () => void;
  clearSelectedId: () => void;
}

export const CanvasToolbar: React.FC<CanvasToolbarProps> = ({
  tool,
  setTool,
  clearActivePoints,
  clearSelectedId,
}) => (
  <div className="absolute top-1/2 -translate-y-1/2 left-4 z-10 bg-white shadow-xl rounded-xl border border-gray-200 p-2 flex flex-col space-y-3">
    <button
      onClick={() => {
        setTool("select");
        clearActivePoints();
      }}
      className={`p-2 rounded-lg transition-colors ${
        tool === "select"
          ? "bg-blue-100 text-blue-600"
          : "text-gray-500 hover:bg-gray-100"
      }`}
      title="Select"
    >
      <MousePointer2 size={22} />
    </button>
    <div className="w-full h-px bg-gray-200" />
    <button
      onClick={() => {
        setTool("frame");
        clearActivePoints();
        clearSelectedId();
      }}
      className={`p-2 rounded-lg transition-colors ${
        tool === "frame"
          ? "bg-blue-100 text-blue-600"
          : "text-gray-500 hover:bg-gray-100"
      }`}
      title="Draw Frame"
    >
      <Square size={22} />
    </button>
    <button
      onClick={() => {
        setTool("polygon");
        clearSelectedId();
      }}
      className={`p-2 rounded-lg transition-colors ${
        tool === "polygon"
          ? "bg-blue-100 text-blue-600"
          : "text-gray-500 hover:bg-gray-100"
      }`}
      title="Draw Property Area"
    >
      <Hexagon size={22} />
    </button>
  </div>
);
