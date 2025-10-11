import {
  MoreVertical,
  ChevronLast,
  ChevronFirst,
  LogOut,
  User,
  Settings,
} from "lucide-react";
import {
  useContext,
  createContext,
  useState,
  useRef,
  useEffect,
  type JSX,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/hook";
import { logout } from "../../store/authSlice";

const SidebarContext = createContext({ expanded: false });

export default function Sidebar({ children }: { children: JSX.Element[] }) {
  const [expanded, setExpanded] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <aside
      className={`h-screen transition-all duration-300 ${
        expanded ? "w-72" : "w-16"
      }`}
    >
      <nav className="h-full flex flex-col bg-white border-r shadow-sm">
        <div className="p-4 pb-2 flex justify-between items-center">
          <img
            src="https://img.logoipsum.com/243.svg"
            className={`overflow-hidden transition-all ${
              expanded ? "w-32" : "w-0"
            }`}
            alt=""
          />
          <button
            onClick={() => setExpanded((curr) => !curr)}
            className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100"
          >
            {expanded ? <ChevronFirst /> : <ChevronLast />}
          </button>
        </div>

        <SidebarContext.Provider value={{ expanded }}>
          <ul className="flex-1 px-3">{children}</ul>
        </SidebarContext.Provider>

        <div className="border-t flex p-3 relative">
          <img
            src={`https://ui-avatars.com/api/?name=${getInitials(
              user?.full_name || "User"
            )}&background=c7d2fe&color=3730a3&bold=true`}
            alt="avatar"
            className="w-10 h-10 rounded-md"
          />
          <div
            className={`flex justify-between items-center overflow-hidden transition-all ${
              expanded ? "w-52 ml-3" : "w-0"
            }`}
          >
            <div className="leading-4">
              <h4 className="font-semibold">{user?.full_name || "User"}</h4>
              <span className="text-xs text-gray-600">
                {user?.email || "user@example.com"}
              </span>
            </div>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <MoreVertical size={20} />
            </button>
          </div>

          {/* Dropdown Menu */}
          {showMenu && expanded && (
            <div
              ref={menuRef}
              className="absolute bottom-16 right-3 bg-white border rounded-lg shadow-lg py-2 w-48 z-50"
            >
              <button
                onClick={() => {
                  setShowMenu(false);
                  navigate("/profile");
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <User size={16} />
                <span>Profile</span>
              </button>
              <button
                onClick={() => {
                  setShowMenu(false);
                  navigate("/settings");
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Settings size={16} />
                <span>Settings</span>
              </button>
              <hr className="my-2" />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </nav>
    </aside>
  );
}

type SidebarItemProps = {
  icon: JSX.Element;
  text: string;   
  active?: boolean;
  alert?: boolean;
  href: string;
};

export function SidebarItem({
  icon,
  text,
  active,
  alert,
  href,
}: SidebarItemProps) {
  const { expanded } = useContext(SidebarContext);

  return (
    <li>
      <Link
        to={href}
        className={`
          relative flex items-center py-2 px-3 my-1
          font-medium rounded-md
          transition-colors group
          ${
            active
              ? "bg-gradient-to-tr from-indigo-200 to-indigo-100 text-indigo-800"
              : "hover:bg-indigo-50 text-gray-600"
          }
        `}
      >
        {icon}
        <span
          className={`overflow-hidden transition-all ${
            expanded ? "w-52 ml-3" : "w-0"
          }`}
        >
          {text}
        </span>
        {alert && (
          <div
            className={`absolute right-2 w-2 h-2 rounded bg-indigo-400 ${
              expanded ? "" : "top-2"
            }`}
          />
        )}

        {!expanded && (
          <div
            className={`
              absolute left-full rounded-md px-2 py-1 ml-6
              bg-indigo-100 text-indigo-800 text-sm w-[120px]
              invisible opacity-20 -translate-x-3 transition-all
              group-hover:visible group-hover:opacity-100 group-hover:translate-x-0
            `}
          >
            {text}
          </div>
        )}
      </Link>
    </li>
  );
}
