import {
  HimtiLogo,
  DashboardIcon,
  LinkIcon,
  EmailIcon,
  CertificateIcon,
} from "@/components/icons";

const Sidebar = () => {
  return (
    <aside className="w-[393px] bg-primary-600 text-white h-screen flex flex-col py-12 px-8 fixed left-0 top-0 overflow-y-auto font-sans z-40">
      <div className="mb-16 px-3 mt-3">
        <div className="mb-9">
          <HimtiLogo />
        </div>

        <div className="flex flex-col">
          <div className="text-h4 max-w-[180px] leading-none tracking-tight text-white">
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

      <div className="mt-auto px-3 pb-4">
        <p className="text-body-1 text-white/50 ">
          © KOMTIG HIMTI BINUS 2026/2027
        </p>
      </div>
    </aside>
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
        flex items-center gap-3 px-4 py-2 rounded-lg text-h6 transition-all duration-200 group
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
