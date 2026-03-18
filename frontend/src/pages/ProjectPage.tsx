import { useState } from "react";
import { SketchCanvas } from "../components/SketchCanvas";
import { Shield, MoreVertical, Share, Save } from "lucide-react";

export const ProjectPage = () => {
  const [projectName, setProjectName] = useState("Untitled Project");
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="h-screen w-full flex flex-col relative overflow-hidden bg-gray-50">
      <div className="absolute top-4 left-4 z-20 bg-white shadow-md rounded-lg flex items-center px-3 py-2 border border-gray-200">
        <h1 className="font-extrabold text-xl tracking-tight text-gray-900 mr-2 ml-1">
          FieldDrop
        </h1>

        <div
          className="flex items-center px-3 py-1 hover:bg-gray-100 rounded-md cursor-pointer transition-colors group"
          onClick={() => setIsEditing(true)}
        >
          <Shield size={16} className="text-purple-500 mr-2" />
          {isEditing ? (
            <input
              autoFocus
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              onBlur={() => setIsEditing(false)}
              onKeyDown={(e) => e.key === "Enter" && setIsEditing(false)}
              className="font-medium text-gray-800 bg-transparent border-none focus:outline-none focus:ring-0 p-0 w-32"
            />
          ) : (
            <span className="font-medium text-gray-800 truncate max-w-[150px]">
              {projectName}
            </span>
          )}
        </div>

        <button className="p-1.5 hover:bg-gray-100 rounded-md text-gray-600 transition-colors ml-1">
          <MoreVertical size={18} />
        </button>
        <button className="p-1.5 hover:bg-gray-100 rounded-md text-gray-600 transition-colors ml-1">
          <Share size={18} />
        </button>
        <button className="ml-2 bg-blue-50 drop-shadow-sm hover:bg-blue-100 text-blue-700 text-sm font-semibold px-4 py-1.5 rounded-md transition-colors flex items-center">
          <Save size={16} className="mr-1.5" />
          Save
        </button>
      </div>

      <div className="flex-1 w-full h-full">
        <SketchCanvas
          onSketchComplete={(geojson, area) => {
            console.log("GeoJSON:", geojson, "Area:", area);
          }}
        />
      </div>
    </div>
  );
};
