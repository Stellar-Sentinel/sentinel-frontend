export type EventReference = { id: string };

export function eventIdFromSearch(search: string) {
  return new URLSearchParams(search).get("event");
}

export function eventDetailUrl(currentUrl: string, eventId: string) {
  const url = new URL(currentUrl);
  url.searchParams.set("event", eventId);
  return url.toString();
}

export function closeEventDetailUrl(currentUrl: string) {
  const url = new URL(currentUrl);
  url.searchParams.delete("event");
  return url.toString();
}

export function selectedEvent<T extends EventReference>(events: T[], eventId: string | null) {
  return eventId ? events.find((event) => event.id === eventId) ?? null : null;
}
