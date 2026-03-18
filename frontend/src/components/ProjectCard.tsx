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
      className="border-2 border-gray-400 h-40 rounded-lg cursor-pointer bg-gray-50 flex justify-center items-center"
    >
      <p className="text-lg">{project.name}</p>
    </div>
  );
};
