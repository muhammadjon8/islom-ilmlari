import { Outlet, useLocation } from "react-router-dom";
import Sidebar, { SidebarItem } from "../shared/components/Sidebar";

export default function DashboardLayout() {
  const location = useLocation();

  return (
    <div className="flex">
      <Sidebar>
        <SidebarItem
          text="Candidate"
          icon={<span>🛠️</span>}
          active={location.pathname === "/candidate"}
          alert={true}
          href="/candidate"
        />
        <SidebarItem
          text="Home"
          icon={<span>🛠️</span>}
          active={location.pathname === "/home"}
          alert={false}
          href="/home"
        />
        <SidebarItem
          text="Application"
          icon={/*<SettingsApplications />*/ <span>🛠️</span>}
          active={location.pathname === "/applications"}
          alert={false}
          href="/applications"
        />
      </Sidebar>

      <main className="flex-1 p-4 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
