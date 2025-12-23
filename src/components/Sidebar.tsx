import React from "react";
import logoHimti from "../assets/logo-himti.svg";

import { FaTable, FaLink, FaEnvelope, FaCertificate } from "react-icons/fa6";

const Sidebar = () => {
  return (
    <aside className="w-[260px] bg-[#3b5598] text-white h-screen flex flex-col p-6 fixed left-0 top-0 overflow-y-auto font-public-sans z-40">
      {/* --- BRAND / LOGO SECTION --- */}
      <div className="mb-6 px-3">
        {/* Update: Hapus border/background, langsung img size besar */}
        <div className="mb-6">
          <img
            src={logoHimti}
            alt="HIMTI Logo"
            className="w-[80px] h-auto object-contain"
          />
        </div>

        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-wide leading-none">
            HIMTI
          </h1>
          <span className="text-sm text-blue-100 font-normal tracking-wide">
            Helper Tools
          </span>
        </div>
      </div>
      {/* --- 2. MENU NAVIGATION --- */}
      <nav className="flex flex-col gap-2">
        <MenuItem icon={<FaTable />} label="Dashboard" />
        <MenuItem icon={<FaLink />} label="URL Shortener" active={true} />
        <MenuItem icon={<FaEnvelope />} label="E-mail Blaster" />
        <MenuItem icon={<FaCertificate />} label="Certificate Generator" />
      </nav>

      {/* --- 3. SIDEBAR FOOTER (Baru) --- */}
      <div className="mt-auto px-3 pb-4">
        <p className="text-[10px] text-blue-200/70 font-semibold tracking-wider uppercase">
          © KOMTIG HIMTI BINUS 2026/2027
        </p>
      </div>
    </aside>
  );
};

// --- Sub-Component Menu Item ---
interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

const MenuItem = ({ icon, label, active = false }: MenuItemProps) => {
  return (
    <a
      href="#"
      className={`
        flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-all duration-200 group
        ${
          active
            ? "bg-white text-[#3b5598] font-bold shadow-md"
            : "text-white/80 hover:bg-white/10 hover:text-white"
        }
      `}
    >
      <span
        className={`text-lg ${
          active ? "text-[#3b5598]" : "text-white/80 group-hover:text-white"
        }`}
      >
        {icon}
      </span>
      <span>{label}</span>
    </a>
  );
};

export default Sidebar;
