import { FileText, MoreHorizontal, Pencil, Trash2, UsersRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Subevent } from "@/types/events";
import { formatEventDate, formatSubeventType } from "@/utils/events";

import { StatusBadge } from "./StatusBadge";

const SubeventActions = ({ name }: { name: string }) => (
  <div className="flex items-center justify-end gap-2">
    <Button type="button" variant="outline" size="sm" aria-label={`Forms for ${name}`}>
      <FileText />
      <span className="hidden xl:inline">Forms</span>
    </Button>
    <Button
      type="button"
      variant="outline"
      size="sm"
      aria-label={`Participants for ${name}`}
    >
      <UsersRound />
      <span className="hidden xl:inline">Participants</span>
    </Button>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <IconButton label={`More actions for ${name}`}>
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
  </div>
);

interface SubeventsListProps {
  subevents: Subevent[];
}

export const SubeventsList = ({ subevents }: SubeventsListProps) => (
  <section aria-label="Sub-events" className="border-t border-border">
    <div className="hidden overflow-x-auto xl:block">
      <table className="w-full min-w-[760px] border-collapse text-left">
        <thead className="bg-muted/70">
          <tr className="border-b border-border">
            <th className="px-5 py-3 text-ds-subtle-semibold">Sub-event</th>
            <th className="px-4 py-3 text-ds-subtle-semibold">Date</th>
            <th className="px-4 py-3 text-ds-subtle-semibold">Type</th>
            <th className="px-4 py-3 text-ds-subtle-semibold">Status</th>
            <th className="px-5 py-3 text-ds-subtle-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {subevents.map((subevent) => (
            <tr
              key={subevent.id}
              className="border-b border-border/70 last:border-b-0 hover:bg-muted/35"
            >
              <td className="max-w-xs px-5 py-3 text-sm font-medium">
                {subevent.name}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm text-muted-foreground">
                {formatEventDate(subevent.date)}
              </td>
              <td className="px-4 py-3 text-sm">
                {formatSubeventType(subevent.type)}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={subevent.status} />
              </td>
              <td className="px-5 py-3">
                <SubeventActions name={subevent.name} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <div className="divide-y divide-border xl:hidden">
      {subevents.map((subevent) => (
        <article key={subevent.id} className="space-y-4 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h4 className="text-ds-body-medium">{subevent.name}</h4>
              <p className="mt-1 text-ds-subtle text-semantic-foreground/70">
                {formatEventDate(subevent.date)}
              </p>
            </div>
            <StatusBadge status={subevent.status} />
          </div>
          <dl className="grid grid-cols-2 gap-3 text-ds-subtle">
            <div>
              <dt className="text-semantic-foreground/60">Type</dt>
              <dd className="mt-1 font-medium">{formatSubeventType(subevent.type)}</dd>
            </div>
            <div>
              <dt className="text-semantic-foreground/60">Visibility</dt>
              <dd className="mt-1 font-medium">
                {subevent.visibility.replace("_", " ")}
              </dd>
            </div>
          </dl>
          <SubeventActions name={subevent.name} />
        </article>
      ))}
    </div>
  </section>
);
