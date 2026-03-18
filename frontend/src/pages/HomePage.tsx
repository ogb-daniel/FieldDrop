import { useRef } from "react";
import { Header } from "../components/Header";
import { Sidebar } from "../components/Sidebar";

export const HomePage = () => {
  const ref = useRef<HTMLDivElement | null>(null);
  const handleMenuClick = (e: React.MouseEvent<SVGSVGElement>) => {
    e.stopPropagation();
    ref.current?.classList.add("translate-x-0");
    ref.current?.classList.remove("-translate-x-[279px]");
    ref.current?.classList.add("shadow-xl");
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
      </main>
    </div>
  );
};
