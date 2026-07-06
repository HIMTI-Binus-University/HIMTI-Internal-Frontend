import type {
  Event,
  EventSort,
  EventStatusFilter,
  SubeventType,
  VisibilityFilter,
} from "@/types/events";

export interface EventFilters {
  query: string;
  status: EventStatusFilter;
  visibility: VisibilityFilter;
  sort: EventSort;
}

export const filterAndSortEvents = (
  events: Event[],
  filters: EventFilters,
): Event[] => {
  const query = filters.query.trim().toLocaleLowerCase();

  return events
    .filter((event) => {
      const matchesQuery =
        !query ||
        event.name.toLocaleLowerCase().includes(query) ||
        event.subevents.some((subevent) =>
          subevent.name.toLocaleLowerCase().includes(query),
        );
      const matchesStatus =
        filters.status === "ALL" || event.status === filters.status;
      const matchesVisibility =
        filters.visibility === "ALL" ||
        event.subevents.some(
          (subevent) => subevent.visibility === filters.visibility,
        );

      return matchesQuery && matchesStatus && matchesVisibility;
    })
    .sort((left, right) => {
      const difference =
        new Date(right.createdAt).getTime() -
        new Date(left.createdAt).getTime();
      return filters.sort === "NEWEST" ? difference : -difference;
    });
};

export const formatSubeventType = (type: SubeventType): string =>
  type
    .toLocaleLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toLocaleUpperCase() + word.slice(1))
    .join(" ");

export const formatEventDate = (date: string): string =>
  new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
    timeZoneName: "short",
  }).format(new Date(date));
