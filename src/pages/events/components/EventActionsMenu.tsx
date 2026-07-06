import { FaArchive, FaEllipsisV, FaPencilAlt, FaTrashAlt } from "react-icons/fa";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const EventActionsMenu = () => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label="Open event actions"
      >
        <FaEllipsisV />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-44">
      <DropdownMenuItem>
        <FaPencilAlt />
        Edit event
      </DropdownMenuItem>
      <DropdownMenuItem>
        <FaArchive />
        Archive event
      </DropdownMenuItem>
      <DropdownMenuItem className="text-semantic-danger focus:text-semantic-danger">
        <FaTrashAlt />
        Delete event
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);
