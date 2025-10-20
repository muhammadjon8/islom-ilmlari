import { Outlet, useLocation } from "react-router-dom";
import Sidebar, { SidebarItem } from "../shared/components/Sidebar";
import {
  BadgeQuestionMark,
  Book,
  Feather,
  LightbulbIcon,
  MenuIcon,
  Newspaper,
  PlaneIcon,
} from "lucide-react";
import { DuaIcon, QiblaIcon, QuranIcon, QuranIcon2 } from "../assets/icons";

export default function DashboardLayout() {
  const location = useLocation();

  return (
    <div className="flex h-screen">
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
          icon={<BadgeQuestionMark />}
          active={location.pathname === "/savollar"}
          href="/savollar"
        />
        <SidebarItem
          text="Yangiliklar"
          icon={<Newspaper />}
          active={location.pathname === "/yangiliklar"}
          href="/yangiliklar"
        />
        <SidebarItem
          text="Boblar"
          icon={<Feather />}
          active={location.pathname === "/bob"}
          href="/bob"
        />
        <SidebarItem
          text="Umra Amallari"
          icon={<PlaneIcon />}
          active={location.pathname === "/umra-amallari"}
          href="/umra-amallari"
        />
      </Sidebar>

      <main className="flex-1 p-4 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
