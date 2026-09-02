import { useRef } from "react";
import { useGetMe } from "@/api/auth/queries";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { publicRoutes } from "@/config/routes";
import { gsap, useGSAP } from "@/lib/motion";
import type { Route } from "@/types/route";
import { authClient } from "@/utils/auth-client";
import {
  Award,
  BadgeCheck,
  CalendarDays,
  Vote,
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
  "router-elections": Vote,
  "router-batches": Layers3,
  "router-certificate-generator": Award,
  "router-rbac-permissions": KeyRound,
  "router-rbac-roles": BadgeCheck,
  "router-rbac-users": Users,
};

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: session, isPending } = authClient.useSession();
  const { data: meData } = useGetMe(!!session);
  const overlayRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const firstRender = useRef(true);

  useGSAP(
    () => {
      const overlay = overlayRef.current;
      const panel = panelRef.current;
      if (!overlay || !panel) return;

      const media = gsap.matchMedia();
      media.add(
        {
          desktop: "(min-width: 1024px)",
          reduceMotion: "(prefers-reduced-motion: reduce)",
          mobile: "(max-width: 1023px)",
        },
        ({ conditions }) => {
          if (conditions?.desktop) {
            gsap.set(overlay, { autoAlpha: 0, pointerEvents: "none" });
            gsap.set(panel, { x: 0, xPercent: 0 });
            return;
          }

          const open = isOpen;
          gsap.set(overlay, { pointerEvents: open ? "auto" : "none" });
          if (firstRender.current || conditions?.reduceMotion) {
            gsap.set(overlay, { autoAlpha: open ? 1 : 0 });
            gsap.set(panel, { x: 0, xPercent: open ? 0 : -100 });
          } else {
            gsap.to(overlay, {
              autoAlpha: open ? 1 : 0,
              duration: 0.22,
              ease: "power3.out",
              overwrite: "auto",
            });
            gsap.to(panel, {
              x: 0,
              xPercent: open ? 0 : -100,
              duration: 0.22,
              ease: "power3.out",
              overwrite: "auto",
            });
          }
          firstRender.current = false;
        },
      );
      return () => media.revert();
    },
    { dependencies: [isOpen], revertOnUpdate: true },
  );

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
        route.isEnabled &&
        route.isProtected &&
        route.group &&
        route.requiredPermission,
    )
    .filter(
      (route) =>
        !route.requiredPermission ||
        meData?.permissions.includes(route.requiredPermission) ||
        route.allowedRoles?.some((role) => meData?.roles.includes(role)),
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
        ref={overlayRef}
        type="button"
        aria-label="Close navigation"
        onClick={onClose}
        className="fixed inset-0 z-30 bg-slate-950/45 lg:hidden"
      />

      <aside
        ref={panelRef}
        className="scrollbar-on-dark fixed left-0 top-0 z-40 flex h-screen w-[min(272px,calc(100vw-2rem))] shrink-0 flex-col justify-between overflow-y-auto bg-brand-primary-1 p-5 font-sans text-white lg:w-[272px]"
      >
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <div className="flex min-w-0 items-center gap-3 px-1">
              <img
                src="/icon-primary.svg"
                alt=""
                width={40}
                height={46}
                className="h-[46px] w-10 shrink-0 object-contain brightness-0 invert"
              />
              <div className="flex flex-col">
                <span className="text-base font-bold leading-5">
                  HIMTI BINUS
                </span>
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
                      active={
                        location.pathname === route.path ||
                        location.pathname.startsWith(`${route.path}/`)
                      }
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
                    <div className="flex flex-col gap-1">
                      <Skeleton
                        aria-hidden="true"
                        className="h-3 w-16 rounded bg-brand-primary-1/20"
                      />
                      <Skeleton
                        aria-hidden="true"
                        className="h-4 w-24 rounded bg-brand-primary-1/20"
                      />
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
            <DropdownMenuContent
              side="top"
              align="start"
              className="min-w-[220px]"
            >
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
}: MenuItemProps) => {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const iconRef = useRef<SVGSVGElement>(null);

  useGSAP(
    () => {
      const link = linkRef.current;
      const icon = iconRef.current;
      if (!link || !icon) return;

      gsap.set(icon, { opacity: active ? 1 : 0.75 });
      if (active) return;

      const media = gsap.matchMedia();
      media.add(
        {
          reduceMotion: "(prefers-reduced-motion: reduce)",
          allowMotion: "(prefers-reduced-motion: no-preference)",
        },
        ({ conditions }) => {
          const setOpacity = (opacity: number) => {
            if (conditions?.reduceMotion) gsap.set(icon, { opacity });
            else
              gsap.to(icon, {
                opacity,
                duration: 0.15,
                ease: "power2.out",
                overwrite: "auto",
              });
          };
          const show = () => setOpacity(1);
          const hide = () => setOpacity(0.75);
          const blur = (event: FocusEvent) => {
            if (!link.contains(event.relatedTarget as Node | null)) hide();
          };
          link.addEventListener("pointerenter", show);
          link.addEventListener("pointerleave", hide);
          link.addEventListener("focusin", show);
          link.addEventListener("focusout", blur);
          return () => {
            link.removeEventListener("pointerenter", show);
            link.removeEventListener("pointerleave", hide);
            link.removeEventListener("focusin", show);
            link.removeEventListener("focusout", blur);
          };
        },
      );
      return () => media.revert();
    },
    { dependencies: [active], scope: linkRef, revertOnUpdate: true },
  );

  return (
    <Link
      ref={linkRef}
      to={path}
      onClick={onClick}
      className={`flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150 ${
        active
          ? "bg-white font-semibold text-brand-primary-1"
          : "text-white/75 hover:bg-white/10 hover:text-white"
      }`}
    >
      <Icon
        ref={iconRef}
        aria-hidden="true"
        size={18}
        strokeWidth={1.75}
        className="shrink-0"
      />
      <span>{label}</span>
    </Link>
  );
};

export default Sidebar;
