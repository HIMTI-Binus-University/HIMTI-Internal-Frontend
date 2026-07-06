import {
  FaEllipsisV,
  FaFileAlt,
  FaPencilAlt,
  FaTrashAlt,
  FaUsers,
} from "react-icons/fa";

import { Button } from "@/components/ui/button";
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
      <FaFileAlt />
      <span className="hidden xl:inline">Forms</span>
    </Button>
    <Button
      type="button"
      variant="outline"
      size="sm"
      aria-label={`Participants for ${name}`}
    >
      <FaUsers />
      <span className="hidden xl:inline">Participants</span>
    </Button>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={`More actions for ${name}`}
        >
          <FaEllipsisV />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem>
          <FaPencilAlt />
          Edit sub-event
        </DropdownMenuItem>
        <DropdownMenuItem className="text-semantic-danger focus:text-semantic-danger">
          <FaTrashAlt />
          Delete sub-event
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
);

interface SubeventsListProps {
  subevents: Subevent[];
}

export const SubeventsList = ({ subevents }: SubeventsListProps) => (
  <section aria-label="Sub-events" className="border-t border-semantic-border/60">
    <div className="hidden overflow-x-auto md:block">
      <table className="w-full min-w-[760px] border-collapse text-left">
        <thead className="bg-semantic-input/70">
          <tr className="border-b border-semantic-border/60">
            <th className="px-5 py-3 text-ds-subtle-semibold">Sub-event</th>
            <th className="px-4 py-3 text-ds-subtle-semibold">Date</th>
            <th className="px-4 py-3 text-ds-subtle-semibold">Type</th>
            <th className="px-4 py-3 text-ds-subtle-semibold">Status</th>
            <th className="px-5 py-3 text-right text-ds-subtle-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {subevents.map((subevent) => (
            <tr
              key={subevent.id}
              className="border-b border-semantic-border/40 last:border-b-0"
            >
              <td className="max-w-xs px-5 py-4 text-ds-body-medium">
                {subevent.name}
              </td>
              <td className="whitespace-nowrap px-4 py-4 text-ds-subtle text-semantic-foreground/75">
                {formatEventDate(subevent.date)}
              </td>
              <td className="px-4 py-4 text-ds-subtle">
                {formatSubeventType(subevent.type)}
              </td>
              <td className="px-4 py-4">
                <StatusBadge status={subevent.status} />
              </td>
              <td className="px-5 py-4">
                <SubeventActions name={subevent.name} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <div className="divide-y divide-semantic-border/50 md:hidden">
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
