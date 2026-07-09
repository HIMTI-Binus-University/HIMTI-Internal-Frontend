import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

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
    <DropdownMenuContent align="end" className="w-36">
      <DropdownMenuItem>
        <Pencil />
        Edit
      </DropdownMenuItem>
      <DropdownMenuItem className="text-semantic-danger focus:bg-semantic-danger-background focus:text-semantic-danger">
        <Trash2 />
        Delete
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);
