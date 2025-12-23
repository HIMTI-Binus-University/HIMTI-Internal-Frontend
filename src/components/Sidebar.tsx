import React from "react";
import HimtiLogo from "./HimtiLogo";
// Update: Ganti FaTable jadi FaThLarge (Icon Dashboard kotak-kotak ala Josh)
import { FaThLarge, FaLink, FaEnvelope, FaCertificate } from "react-icons/fa";

const Sidebar = () => {
  return (
    <aside className="w-[260px] bg-primary-600 text-white h-screen flex flex-col p-6 fixed left-0 top-0 overflow-y-auto font-sans z-40">
      {/* --- BRAND / LOGO SECTION --- */}
      <div className="mb-6 px-3">
        {/* LOGO */}
        <div className="mb-5">
          <HimtiLogo className="w-[80px] h-auto" />
        </div>

        {/* TYPOGRAPHY FIX */}
        <div className="flex flex-col">
          {/* 1. HIMTI: Hapus 'tracking-wide', ganti jadi 'tracking-tight' biar rapet */}
          <h1 className="text-2xl font-bold leading-none tracking-tight">
            HIMTI
          </h1>
          {/* 2. Helper Tools: Normal tracking, warna putih transparan */}
          <span className="text-sm text-white/80 font-normal mt-1">
            Helper Tools
          </span>
        </div>
      </div>

      {/* --- MENU NAVIGATION --- */}
      <nav className="flex flex-col gap-2">
        {/* Icon Dashboard diganti biar mirip desain */}
        <MenuItem icon={<FaThLarge />} label="Dashboard" />
        <MenuItem icon={<FaLink />} label="URL Shortener" active={true} />
        <MenuItem icon={<FaEnvelope />} label="E-mail Blaster" />
        <MenuItem icon={<FaCertificate />} label="Certificate Generator" />
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
            ? // Warna text aktif pake primary-600 (Biru HIMTI)
              "bg-white text-primary-600 font-bold shadow-md"
            : "text-white/80 hover:bg-white/10 hover:text-white"
        }
      `}
    >
      <span
        className={`text-lg ${
          active ? "text-primary-600" : "text-white/80 group-hover:text-white"
        }`}
      >
        {icon}
      </span>
      <span>{label}</span>
    </a>
  );
};

export default Sidebar;
