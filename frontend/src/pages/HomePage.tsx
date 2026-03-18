import { useEffect, useRef, useState } from "react";
import { Header } from "../components/Header";
import { Sidebar } from "../components/Sidebar";
import apiClient from "../api/client";
import { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import type { Project } from "../types/project";
import { ProjectCard } from "../components/ProjectCard";

export const HomePage = () => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [projects, setProjects] = useState<Project[] | null>(null);
  useEffect(() => {
    apiClient.get<Project[]>("/projects").then((res) => setProjects(res.data));
  }, []);
  const navigate = useNavigate();
  const handleMenuClick = (e: React.MouseEvent<SVGSVGElement>) => {
    e.stopPropagation();
    ref.current?.classList.add("translate-x-0");
    ref.current?.classList.remove("-translate-x-[279px]");
    ref.current?.classList.add("shadow-xl");
  };
  const handleNewProject = async () => {
    try {
      const response = await apiClient.post<{ id: string }>("/projects", {});
      if (response.status === 201) {
        console.log("Success:", response.data);
        navigate(`/project/${response.data.id}`);
      }
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        console.error(error.response?.data);
      } else if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error("An error occured");
      }
    }
  };
  return (
    <div
      className="flex h-screen relative"
      onClick={() => {
        ref.current?.classList.add("-translate-x-[279px]");
        ref.current?.classList.remove("translate-x-0");
        ref.current?.classList.remove("shadow-xl");
      }}
    >
      <div
        ref={ref}
        className="absolute md:static h-full -translate-x-[279px] md:translate-x-0 transition-all duration-500 bg-white border-r border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        <Sidebar />
      </div>
      <main className="flex-1">
        <Header onMenuClick={handleMenuClick} />
        <section className="p-6">
          <h2 className="text-2xl font-semibold">Projects</h2>
          <div className="grid grid-cols-3 mt-4 gap-4">
            <div
              onClick={handleNewProject}
              className="border-2 border-dashed border-gray-400 h-40 rounded-lg cursor-pointer bg-gray-50 flex justify-center items-center"
            >
              <p className="text-lg">+ New Project</p>
            </div>
            {projects?.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};
