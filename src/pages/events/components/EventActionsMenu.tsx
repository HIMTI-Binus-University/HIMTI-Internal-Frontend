import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { IconButton } from "@/components/ui/icon-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const EventActionsMenu = ({ eventId }: { eventId: string }) => {
  const navigate = useNavigate();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <IconButton label="Open event actions">
          <MoreHorizontal />
        </IconButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36">
        <DropdownMenuItem
          className="text-semantic-warning focus:bg-semantic-warning focus:text-white"
          onSelect={() => navigate(`/events/${eventId}/edit`)}
        >
          <Pencil />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem className="text-semantic-danger focus:bg-semantic-danger focus:text-white">
          <Trash2 />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
