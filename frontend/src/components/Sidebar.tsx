import { Home } from "lucide-react";
import { useRef } from "react";
import { Link, useLocation } from "react-router-dom";

export const Sidebar = () => {
  const homeIconRef = useRef<SVGSVGElement | null>(null);
  const location = useLocation();
  const pathname = location.pathname;
  return (
    <aside className="w-[279px]  p-5">
      <nav className="list-none">
        <li
          onMouseOver={() => {
            if (pathname === "/") return;
            homeIconRef.current?.classList.remove("text-gray-600");
          }}
          onMouseLeave={() => {
            if (pathname === "/") return;

            homeIconRef.current?.classList.add("text-gray-600");
          }}
          className={`hover:bg-gray-200 ${pathname === "/" && "bg-gray-200 font-semibold"} px-3 py-2 cursor-pointer rounded-md flex items-center gap-3`}
        >
          <Home
            ref={homeIconRef}
            size={15}
            className={` ${pathname === "/" ? "text-black" : "text-gray-600"}`}
          />
          Home
          <Link to="/" />
        </li>
      </nav>
    </aside>
  );
};
