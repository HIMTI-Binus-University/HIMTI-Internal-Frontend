import { Archive, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { IconButton } from "@/components/ui/icon-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const EventActionsMenu = () => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <IconButton label="Open event actions">
        <MoreHorizontal />
      </IconButton>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-44">
      <DropdownMenuItem>
        <Pencil />
        Edit event
      </DropdownMenuItem>
      <DropdownMenuItem>
        <Archive />
        Archive event
      </DropdownMenuItem>
      <DropdownMenuItem className="text-semantic-danger focus:bg-semantic-danger-background focus:text-semantic-danger">
        <Trash2 />
        Delete event
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);
