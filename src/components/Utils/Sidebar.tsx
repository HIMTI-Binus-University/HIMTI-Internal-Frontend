import { authClient } from "@/utils/auth-client";
import { useNavigate, useLocation, Link } from "react-router-dom";

import HimtiLogo from "@/components/logos/HimtiLogo";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  FaChevronDown,
  FaChevronLeft,
  FaSignOutAlt,
  FaUserCircle,
  FaKey,
  FaIdBadge,
  FaUsers,
  FaLink,
} from "react-icons/fa";

import { publicRoutes } from "@/config/routes";
import { useGetMe } from "@/api/auth/queries";
import type { Route } from "@/types/route";
import React from "react";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

type IconComponent = React.ComponentType<{ className?: string; width?: number; height?: number }>;

const routeIconMap: Record<string, IconComponent> = {
  "router-url-shortener": FaLink,
  "router-rbac-permissions": FaKey,
  "router-rbac-roles": FaIdBadge,
  "router-rbac-users": FaUsers,
};

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: session, isPending } = authClient.useSession();
  const { data: meData } = useGetMe(!!session);

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          navigate("/login");
        },
      },
    });
  };

  const navRoutes = publicRoutes
    .filter((r) => r.isEnabled && r.isProtected && r.requiredPermission)
    .filter(
      (r) =>
        !r.requiredPermission ||
        meData?.permissions.includes(r.requiredPermission),
    );

  const groupedRoutes = navRoutes.reduce<Record<string, Route[]>>(
    (acc, route) => {
      const group = route.group ?? "Other";
      if (!acc[group]) acc[group] = [];
      acc[group].push(route);
      return acc;
    },
    {},
  );

  return (
    <>
      <div
        onClick={onClose}
        className={`
          fixed inset-0 bg-black/40 z-30 xl:hidden transition-opacity
          ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}
        `}
      />

      <aside
        className={`
          w-1/4 shrink-0 bg-brand-primary-1 text-white h-screen flex flex-col p-8 font-sans justify-between fixed left-0 top-0 z-40 overflow-y-auto xl:sticky xl:top-0
          transition-transform duration-300 ease-in-out xl:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          max-md:w-96
        `}
      >
        <div className="flex flex-col gap-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 px-2">
              <HimtiLogo width={64} />
              <div className="flex flex-col">
                <span className="text-ds-h2 font-bold text-white">HIMTI</span>
                <span className="text-ds-h3 font-light text-white/80">
                  Internal Tools
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="xl:hidden p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close sidebar"
            >
              <FaChevronLeft size={20} />
            </button>
          </div>

          <nav className="flex flex-col gap-6">
            {Object.entries(groupedRoutes).map(([group, routes]) => (
              <div key={group} className="flex flex-col gap-1">
                <p className="text-ds-detail font-semibold uppercase tracking-widest text-white/40 mb-1">
                  {group}
                </p>
                {routes.map((route) => {
                  const Icon = routeIconMap[route.key];
                  const isActive = location.pathname === route.path;
                  return (
                    <MenuItem
                      key={route.key}
                      icon={Icon}
                      label={route.title}
                      path={route.path}
                      active={isActive}
                      onClick={onClose}
                    />
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-6 outline-none">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center gap-3 bg-white rounded-xl px-4 py-3 text-left hover:bg-white/90 transition-colors">
                {session?.user?.image ? (
                  <img
                    src={session.user.image}
                    alt="Profile"
                    className="w-10 h-10 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <FaUserCircle className="text-brand-primary-1 w-10 h-10 shrink-0" />
                )}

                <div className="flex-1 min-w-0">
                  {isPending ? (
                    <div className="animate-pulse flex flex-col gap-1">
                      <div className="h-3 w-16 bg-brand-primary-1/20 rounded"></div>
                      <div className="h-4 w-24 bg-brand-primary-1/20 rounded"></div>
                    </div>
                  ) : (
                    <>
                      <p className="text-ds-detail text-brand-primary-1/60 leading-tight">
                        Logged in as
                      </p>
                      <p className="text-ds-p font-bold text-brand-primary-1 truncate">
                        {session?.user?.name || "User"}
                      </p>
                    </>
                  )}
                </div>

                <FaChevronDown
                  size={12}
                  className="text-brand-primary-1/60 shrink-0"
                />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="top"
              align="start"
              className="w-full min-w-[220px]"
            >
              <DropdownMenuItem
                onClick={handleSignOut}
                className="text-red-600 focus:text-red-600 gap-3 cursor-pointer"
              >
                <FaSignOutAlt />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <p className="text-ds-p text-white/40 font-normal">
            © KOMTIG HIMTI BINUS 2026/2027
          </p>
        </div>
      </aside>
    </>
  );
};

interface MenuItemProps {
  icon: IconComponent;
  label: string;
  path: string;
  active?: boolean;
  onClick?: () => void;
}

const MenuItem = ({
  icon: Icon,
  label,
  path,
  active = false,
  onClick,
}: MenuItemProps) => {
  return (
    <Link
      to={path}
      onClick={onClick}
      className={`
        flex items-center gap-3 px-4 py-3 rounded-xl text-body-1 transition-all duration-200 group
        ${
          active
            ? "bg-white text-brand-primary-1 font-bold"
            : "text-white/70 hover:bg-white/10 hover:text-white"
        }
      `}
    >
      <Icon
        className={`transition-opacity duration-200
            ${active ? "opacity-100" : "opacity-70 group-hover:opacity-100"}
        `}
      />
      <span>{label}</span>
    </Link>
  );
};

export default Sidebar;
