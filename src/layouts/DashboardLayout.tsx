import { Outlet, useLocation } from "react-router-dom";
import Sidebar, { SidebarItem } from "../shared/components/Sidebar";
import {
  Book,
  FileQuestion,
  LightbulbIcon,
  MenuIcon,
  Newspaper,
} from "lucide-react";
import { DuaIcon, QiblaIcon, QuranIcon, QuranIcon2 } from "../assets/icons";

export default function DashboardLayout() {
  const location = useLocation();

  return (
    <div className="flex">
      <Sidebar>
        <SidebarItem
          text="Qur'on Ilmi"
          icon={QuranIcon2}
          active={location.pathname === "/quron-ilmi"}
          href="/quron-ilmi"
        />
        <SidebarItem
          text="Qur'on Tavsiri"
          icon={QuranIcon}
          active={location.pathname === "/quron-tavsiri"}
          href="/quron-tavsiri"
        />
        <SidebarItem
          text="Duolar"
          icon={DuaIcon}
          active={location.pathname === "/duolar"}
          href="/duolar"
        />
        <SidebarItem
          text="Haj Amallari"
          icon={QiblaIcon}
          active={location.pathname === "/haj-amallari"}
          href="/haj-amallari"
        />
        <SidebarItem
          text="Hadis Sharhlari"
          icon={<Book />}
          active={location.pathname === "/hadis-sharhlari"}
          href="/hadis-sharhlari"
        />
        <SidebarItem
          text="Ilm"
          icon={<LightbulbIcon />}
          active={location.pathname === "/ilm"}
          href="/ilm"
        />
        <SidebarItem
          text="Kategoriyalar"
          icon={<MenuIcon />}
          active={location.pathname === "/kategoriyalar"}
          href="/kategoriyalar"
        />
        <SidebarItem
          text="Savollar"
          icon={<FileQuestion />}
          active={location.pathname === "/savollar"}
          href="/savollar"
        />
        <SidebarItem
          text="Yangiliklar"
          icon={<Newspaper />}
          active={location.pathname === "/yangiliklar"}
          href="/yangiliklar"
        />
      </Sidebar>

      <main className="flex-1 p-4 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
