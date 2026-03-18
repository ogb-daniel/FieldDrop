import React from "react";
import { X } from "lucide-react";
import * as turf from "@turf/turf";
import type { Shape } from "../../types/canvas";

interface CanvasPropertiesPanelProps {
  selectedShapeObj: Shape | undefined;
  setSelectedId: (id: string | null) => void;
  SCALE_TURF: number;
  handleEdgeManualUpdate: (id: string, idx: number, val: number) => void;
  deleteShape: () => void;
}

export const CanvasPropertiesPanel: React.FC<CanvasPropertiesPanelProps> = ({
  selectedShapeObj,
  setSelectedId,
  SCALE_TURF,
  handleEdgeManualUpdate,
  deleteShape,
}) => {
  if (selectedShapeObj && selectedShapeObj.type !== "polygon") return null;

  return (
    <div
      className={`${selectedShapeObj && selectedShapeObj.type === "polygon" ? "translate-x-0" : "translate-x-[288px]"}  overflow-hidden absolute top-0 right-0 h-full w-72 bg-white shadow-2xl z-20 flex flex-col border-l border-gray-200 transform transition-transform duration-200`}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <h2 className="font-bold text-gray-800">Property Details</h2>
        <button
          onClick={() => setSelectedId(null)}
          className="text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
            Total Enclosed Area
          </p>
          <p className="text-2xl font-black text-gray-600">
            {selectedShapeObj &&
              selectedShapeObj.type === "polygon" &&
              selectedShapeObj.area.toFixed(2)}{" "}
            <span className="text-sm font-semibold">sq m</span>
          </p>
        </div>
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            Boundary Walls (Meters)
          </p>
          <div className="space-y-3 text-sm">
            {selectedShapeObj &&
              selectedShapeObj.type === "polygon" &&
              selectedShapeObj.points.map((pt, i) => {
                const nextPt =
                  selectedShapeObj.points[
                    (i + 1) % selectedShapeObj.points.length
                  ];
                const dMeters = turf.distance(
                  [pt.x * SCALE_TURF, -(pt.y * SCALE_TURF)],
                  [nextPt.x * SCALE_TURF, -(nextPt.y * SCALE_TURF)],
                  { units: "meters" },
                );
                const pos = ["Top", "Right", "Bottom", "Left"];
                const wallName = i < 4 ? pos[i] : `Wall ${i + 1}`;
                return (
                  <div
                    key={i}
                    className="flex justify-between items-center bg-gray-50 p-2.5 rounded-lg border border-gray-100 hover:border-blue-200 transition-colors"
                  >
                    <span className="font-medium text-gray-600">
                      {wallName}
                    </span>
                    <input
                      type="number"
                      step="0.1"
                      value={dMeters.toFixed(2)}
                      onChange={(e) =>
                        handleEdgeManualUpdate(
                          selectedShapeObj.id,
                          i,
                          parseFloat(e.target.value),
                        )
                      }
                      className="w-24 text-right px-2 py-1 font-semibold text-gray-700 bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                );
              })}
          </div>
        </div>
        <div className="pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500 italic">
            Editing a wall length dynamically shifts the remaining structure to
            maintain continuity.
          </p>
        </div>
        <button
          className="flex cursor-pointer justify-center mt-auto items-center bg-gray-50 p-2.5 rounded-lg border border-gray-100 hover:border-red-200 transition-colors font-semibold text-gray-600 w-full text-center hover:bg-red-400 hover:text-white"
          onClick={deleteShape}
        >
          Delete
        </button>
      </div>
    </div>
  );
};
