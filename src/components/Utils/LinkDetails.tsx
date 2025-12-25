import { 
    FaRegCopy, 
    FaPencilAlt, 
    FaTrashAlt 
} from "react-icons/fa";

import {
  CalendarIcon,
  ExpiredIcon,
  DownRightIcon,
} from "@/components/icons";

type LinkDetailsProps = {
  short: string;
  target: string;
  created: string;
  expires: string;
};

const LinkDetails = ({ short, target, created, expires }: LinkDetailsProps) => {
  return (
    <div className="border shadow-sm cursor-pointer border-black/25 rounded-xl p-5 flex justify-between items-start hover:scale-[101%] transition-transform">
      <div className="space-y-2">
        <p className="font-bold text-h6">{short}</p>

        <div className="flex items-center gap-2 text-body-1">
          <DownRightIcon />
          <span>{target}</span>
        </div>

        <div className="flex items-center gap-6 text-body-3 text-black/50 mt-2">
          <div className="flex items-center gap-1">
            <CalendarIcon />
            Created on {created}
          </div>

          <div className="flex items-center gap-1">
            <ExpiredIcon />
            Expires on {expires}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 text-gray-400">
        <button className="hover:text-primary-600 transition-colors">
          <FaRegCopy />
        </button>
        <button className="hover:text-warning transition-colors">
          <FaPencilAlt />
        </button>
        <button className="hover:text-danger transition-colors">
          <FaTrashAlt />
        </button>
      </div>
    </div>
  );
};

export default LinkDetails;