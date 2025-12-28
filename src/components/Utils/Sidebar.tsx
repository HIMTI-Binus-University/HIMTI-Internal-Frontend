import { useState } from "react";

import {
  HimtiLogo,
  DashboardIcon,
  LinkIcon,
  EmailIcon,
  CertificateIcon,
} from "@/components/icons";

import {
  FaChevronDown,
  FaChevronUp,
  FaSignOutAlt,
  FaPlusCircle,
  FaUserCircle
} from "react-icons/fa";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }:SidebarProps) => {
  const [isUserOpen, setIsUserOpen] = useState(false);

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
          w-[393px] bg-primary-600 text-white h-screen flex flex-col py-9 px-8 font-sans justify-between fixed left-0 top-0 z-40 overflow-y-auto
          transition-transform duration-300 ease-in-out xl:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex flex-col gap-8">
          <div className="px-3">
            <div className="mb-9">
              <HimtiLogo />
            </div>

            <div className="flex flex-col">
              <div className="text-h5 max-w-[150px] leading-none tracking-tight text-white">
                <span className="font-bold">HIMTI</span> Helper Tools
              </div>
            </div>
          </div>

          <nav className="flex flex-col gap-3">
            <MenuItem icon={DashboardIcon} label="Dashboard" />
            <MenuItem icon={LinkIcon} label="URL Shortener" active={true} />
            <MenuItem icon={EmailIcon} label="E-mail Blaster" />
            <MenuItem icon={CertificateIcon} label="Certificate Generator" />
          </nav>
        </div>
        
        <div className="flex flex-col gap-4">
          <div className="w-full relative">
            <button
              onClick={() => setIsUserOpen(!isUserOpen)}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition-colors text-left
              "
            >
              <FaUserCircle className="text-white w-9 h-9" />

              <div className="flex-1">
                <p className="text-sm font-bold leading-tight">Daffa Fayyaz</p>
                <p className="text-xs text-white/60">
                  daffafayyaz@gmail.com
                </p>
              </div>

              {isUserOpen ? (
                <FaChevronUp size={12} className="opacity-70" />
              ) : (
                <FaChevronDown size={12} className="opacity-70" />
              )}
            </button>

            {isUserOpen && (
              <div
                className="absolute bottom-full left-0 mb-2 w-full bg-white rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in duration-150"
              >
                <button
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <FaPlusCircle className="text-gray-400" />
                  Add another account
                </button>

                <button
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 border-t"
                >
                  <FaSignOutAlt />
                  Sign out
                </button>
              </div>
            )}
          </div>

          <div className="mt-auto px-3">
            <p className="text-body-2 text-white/50 ">
              © KOMTIG HIMTI BINUS 2026/2027
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

interface MenuItemProps {
  icon: React.ComponentType<{
    width?: number;
    height?: number;
    className?: string;
  }>;
  label: string;
  active?: boolean;
}

const MenuItem = ({ icon: Icon, label, active = false }: MenuItemProps) => {
  return (
    <a
      href="#"
      className={`
        flex items-center gap-3 px-4 py-2 rounded-md text-body-1 transition-all duration-200 group
        ${
          active
            ? "bg-white text-primary-600 font-bold shadow-md"
            : "text-white/75 hover:bg-white/10 hover:text-white"
        }
      `}
    >
      <Icon
        className={`transition-opacity duration-200
            ${active ? "opacity-100" : "opacity-80 group-hover:opacity-100"}
        `}
      />

      <span>{label}</span>
    </a>
  );
};

export default Sidebar;
