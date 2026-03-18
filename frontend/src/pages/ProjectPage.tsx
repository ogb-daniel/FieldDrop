import { SketchCanvas } from "../components/SketchCanvas";

export const ProjectPage = () => {
  return (
    <div className="h-screen w-full flex flex-col">
      <div className="flex-1">
        <SketchCanvas
          onSketchComplete={(geojson, area) => {
            console.log("GeoJSON:", geojson, "Area:", area);
          }}
        />
      </div>
    </div>
  );
};
