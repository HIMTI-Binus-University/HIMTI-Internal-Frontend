import React from "react";
// Import icon yang dibutuhin
import { FaTable, FaLink, FaEnvelope, FaCertificate } from "react-icons/fa6";

const Sidebar = () => {
  return (
    // Container Sidebar
    <aside className="w-[260px] bg-[#3b5598] text-white h-screen flex flex-col p-5 fixed left-0 top-0 overflow-y-auto">
      {/* --- BRAND / LOGO --- */}
      <div className="mb-10">
        {/* Slot Logo (Kotak transparan) */}
        <div className="bg-white/20 h-[50px] w-[50px] mb-3 rounded-lg flex items-center justify-center text-xs">
          LOGO
        </div>
        <div className="flex flex-col">
          <h1 className="text-xl font-bold tracking-wide leading-none">
            HIMTI
          </h1>
          <span className="text-sm opacity-80 font-light">Helper Tools</span>
        </div>
      </div>

      {/* --- MENU NAVIGATION --- */}
      <nav className="flex flex-col gap-2">
        {/* Menu Items */}
        {/* Yang aktif gw kasih status active={true} biar keliatan beda */}
        <MenuItem icon={<FaTable />} label="Dashboard" />
        <MenuItem icon={<FaLink />} label="URL Shortener" active={true} />
        <MenuItem icon={<FaEnvelope />} label="E-mail Blaster" />
        <MenuItem icon={<FaCertificate />} label="Certificate Generator" />
      </nav>
    </aside>
  );
};

// --- SUB-COMPONENT (Biar kodenya rapi) ---
// Ini setup TypeScript simple biar ga error merah
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
        flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all duration-200 group
        ${
          active
            ? "bg-white text-[#3b5598] font-bold shadow-md" // Style kalau Aktif
            : "text-white/70 hover:bg-white/10 hover:text-white" // Style kalau Tidak Aktif
        }
      `}
    >
      {/* Icon */}
      <span
        className={`text-lg ${
          active ? "text-[#3b5598]" : "text-white/70 group-hover:text-white"
        }`}
      >
        {icon}
      </span>
      {/* Label Text */}
      <span>{label}</span>
    </a>
  );
};

export default Sidebar;
