import React from "react";
import HimtiLogo from "./HimtiLogo";

// --- IMPORT ASSETS ---
import iconDashboard from "../assets/sidebar-dashboard.svg";
import iconUrl from "../assets/sidebar-url.svg";
import iconEmail from "../assets/sidebar-email.svg";
import iconCert from "../assets/sidebar-cert.svg";

const Sidebar = () => {
  return (
    <aside className="w-[260px] bg-primary-600 text-white h-screen flex flex-col p-6 fixed left-0 top-0 overflow-y-auto font-sans z-40">
      {/* --- BRAND SECTION --- */}
      <div className="mb-8 px-3">
        <div className="mb-4">
          <HimtiLogo className="w-[80px] h-auto" />
        </div>

        <div className="flex flex-col">
          <h1 className="text-xl font-bold leading-none tracking-tight text-white">
            HIMTI
          </h1>

          <span className="text-base text-white/80 font-normal mt-1 leading-none">
            Helper Tools
          </span>
        </div>
      </div>

      {/* --- MENU NAVIGATION --- */}
      <nav className="flex flex-col gap-2">
        <MenuItem iconSrc={iconDashboard} label="Dashboard" />
        <MenuItem iconSrc={iconUrl} label="URL Shortener" active={true} />
        <MenuItem iconSrc={iconEmail} label="E-mail Blaster" />
        <MenuItem iconSrc={iconCert} label="Certificate Generator" />
      </nav>

      {/* --- FOOTER --- */}
      <div className="mt-auto px-3 pb-4">
        <p className="text-[10px] text-white/60 font-semibold tracking-wider uppercase">
          © KOMTIG HIMTI BINUS 2026/2027
        </p>
      </div>
    </aside>
  );
};

interface MenuItemProps {
  iconSrc: string;
  label: string;
  active?: boolean;
}

const MenuItem = ({ iconSrc, label, active = false }: MenuItemProps) => {
  return (
    <a
      href="#"
      className={`
        flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-all duration-200 group
        ${
          active
            ? "bg-white text-primary-600 font-bold shadow-md"
            : "text-white/80 hover:bg-white/10 hover:text-white"
        }
      `}
    >
      <img
        src={iconSrc}
        alt=""
        className={`w-[20px] h-[20px] object-contain transition-opacity duration-200
            ${active ? "opacity-100" : "opacity-80 group-hover:opacity-100"}
        `}
      />

      <span>{label}</span>
    </a>
  );
};

export default Sidebar;
