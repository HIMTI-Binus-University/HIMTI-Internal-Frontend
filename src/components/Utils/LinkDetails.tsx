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
  onEdit?: () => void;
  onDelete?: () => void;
  onCopy?: () => void;
  isCopied?: boolean;
};

const LinkDetails = ({ short, target, created, expires, onEdit, onDelete, onCopy, isCopied }: LinkDetailsProps) => {
  return (
    <div className="border shadow-sm cursor-pointer border-black/25 rounded-xl p-5 flex flex-row max-sm:flex-col max-sm:gap-4 justify-between items-start hover:scale-[101%] transition-transform">
      <div className="flex flex-col gap-2">
        <p className="font-bold text-h6 max-lg:text-body-1 max-lg:font-bold break-all whitespace-normal">{short}</p>

        <div className="flex flex-row items-center gap-2 text-body-1 max-lg:text-body-2 overflow-hidden">
          <DownRightIcon />
          <span>{target}</span>
        </div>

        <div className="flex flex-row max-lg:flex-col gap-6 max-lg:gap-2 text-body-3 text-black/50 mt-2">
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
        <button className="hover:text-primary-600 transition-colors" onClick={onCopy}>
          {isCopied ? <h6 className="text-body-3">Copied!</h6> : <FaRegCopy />}
        </button>
        <button className="hover:text-warning-500 transition-colors" onClick={onEdit}>
          <FaPencilAlt />
        </button>
        <button className="hover:text-danger-500 transition-colors" onClick={onDelete}>
          <FaTrashAlt />
        </button>
      </div>
    </div>
  );
};

export default LinkDetails;