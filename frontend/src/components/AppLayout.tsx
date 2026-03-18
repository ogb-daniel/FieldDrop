import { Outlet } from "react-router-dom";

export const AppLayout = () => {
  return (
    <div className="min-h-screen font-architect">
      <Outlet />
    </div>
  );
};
