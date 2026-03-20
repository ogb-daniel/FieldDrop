import { useNavigate } from "react-router-dom";
import type { Project } from "../types/project";

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard = ({ project }: ProjectCardProps) => {
  const navigate = useNavigate();
  const handleViewProject = () => {
    navigate(`/project/${project.id}`);
  };
  return (
    <div
      onClick={handleViewProject}
      className="relative h-40 rounded-t-lg cursor-pointer bg-gray-100"
    >
      {project.thumbnail ? (
        <img
          src={project.thumbnail}
          alt="Project Preview"
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-400">
          No Preview Available
        </div>
      )}
      <p className="absolute bottom-2 left-2 text-shadow-lg text-shadow-blue-400/10 font-bold text-xl">
        {project.name}
      </p>
    </div>
  );
};
