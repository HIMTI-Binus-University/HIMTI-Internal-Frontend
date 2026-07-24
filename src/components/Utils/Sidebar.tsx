import { useGetMe } from "@/api/auth/queries";
import HimtiLogo from "@/components/logos/HimtiLogo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { publicRoutes } from "@/config/routes";
import type { Route } from "@/types/route";
import { authClient } from "@/utils/auth-client";
import {
  BadgeCheck,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  CircleUserRound,
  KeyRound,
  Link2,
  LogOut,
  Layers3,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

const routeIconMap: Record<string, LucideIcon> = {
  "router-url-shortener": Link2,
  "router-events": CalendarDays,
  "router-batches": Layers3,
  "router-rbac-permissions": KeyRound,
  "router-rbac-roles": BadgeCheck,
  "router-rbac-users": Users,
};

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: session, isPending } = authClient.useSession();
  const { data: meData } = useGetMe(!!session);

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => navigate("/login"),
      },
    });
  };

  const navRoutes = publicRoutes
    .filter(
      (route) =>
        route.isEnabled && route.isProtected && route.group && route.requiredPermission,
    )
    .filter(
      (route) =>
        !route.requiredPermission ||
        meData?.permissions.includes(route.requiredPermission),
    );

  const groupedRoutes = navRoutes.reduce<Record<string, Route[]>>(
    (groups, route) => {
      const group = route.group ?? "Other";
      if (!groups[group]) groups[group] = [];
      groups[group].push(route);
      return groups;
    },
    {},
  );

  return (
    <>
      <button
        type="button"
        aria-label="Close navigation"
        onClick={onClose}
        className={`fixed inset-0 z-30 bg-slate-950/45 transition-opacity lg:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`scrollbar-on-dark fixed left-0 top-0 z-40 flex h-screen w-[min(272px,calc(100vw-2rem))] shrink-0 flex-col justify-between overflow-y-auto bg-brand-primary-1 p-5 font-sans text-white transition-transform duration-200 ease-out lg:sticky lg:top-0 lg:w-[272px] lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 px-1">
              <HimtiLogo width={44} />
              <div className="flex flex-col">
                <span className="text-lg font-bold leading-6">HIMTI</span>
                <span className="text-sm font-medium leading-5 text-white/70">
                  Internal Tools
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-white/70 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
              aria-label="Close sidebar"
            >
              <ChevronLeft aria-hidden="true" size={20} strokeWidth={1.75} />
            </button>
          </div>

          <nav className="flex flex-col gap-5" aria-label="Primary navigation">
            {Object.entries(groupedRoutes).map(([group, routes]) => (
              <div key={group} className="flex flex-col gap-1">
                <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-white/55">
                  {group}
                </p>
                {routes.map((route) => {
                  const Icon = routeIconMap[route.key];
                  return (
                    <MenuItem
                      key={route.key}
                      icon={Icon}
                      label={route.title}
                      path={route.path}
                      active={location.pathname === route.path || location.pathname.startsWith(`${route.path}/`)}
                      onClick={onClose}
                    />
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-4 outline-none">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex w-full items-center gap-3 rounded-xl bg-white px-3 py-2.5 text-left transition-colors hover:bg-white/95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80">
                {session?.user?.image ? (
                  <img
                    src={session.user.image}
                    alt="Profile"
                    className="h-9 w-9 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <CircleUserRound className="h-9 w-9 shrink-0 text-brand-primary-1 stroke-[1.5]" />
                )}

                <div className="min-w-0 flex-1">
                  {isPending ? (
                    <div className="flex animate-pulse flex-col gap-1">
                      <div className="h-3 w-16 rounded bg-brand-primary-1/20" />
                      <div className="h-4 w-24 rounded bg-brand-primary-1/20" />
                    </div>
                  ) : (
                    <>
                      <p className="text-xs leading-4 text-brand-primary-1/70">
                        Logged in as
                      </p>
                      <p className="truncate text-sm font-semibold leading-5 text-brand-primary-1">
                        {session?.user?.name || "User"}
                      </p>
                    </>
                  )}
                </div>

                <ChevronDown
                  aria-hidden="true"
                  size={14}
                  strokeWidth={1.75}
                  className="shrink-0 text-brand-primary-1/60"
                />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="min-w-[220px]">
              <DropdownMenuItem
                onClick={handleSignOut}
                className="cursor-pointer gap-3 text-semantic-danger focus:bg-semantic-danger-background focus:text-semantic-danger"
              >
                <LogOut aria-hidden="true" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <p className="px-1 text-xs font-normal leading-5 text-white/50">
            © KOMTIG HIMTI BINUS 2026/2027
          </p>
        </div>
      </aside>
    </>
  );
};

interface MenuItemProps {
  icon: LucideIcon;
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
}: MenuItemProps) => (
  <Link
    to={path}
    onClick={onClick}
    className={`group flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150 ${
      active
        ? "bg-white font-semibold text-brand-primary-1"
        : "text-white/75 hover:bg-white/10 hover:text-white"
    }`}
  >
    <Icon
      aria-hidden="true"
      size={18}
      strokeWidth={1.75}
      className={`shrink-0 transition-opacity duration-150 ${
        active ? "opacity-100" : "opacity-75 group-hover:opacity-100"
      }`}
    />
    <span>{label}</span>
  </Link>
);

export default Sidebar;
