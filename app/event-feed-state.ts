import type { SentinelEvent } from "./event-data";

export type EventFeedState =
  | { kind: "loading" }
  | { kind: "unavailable"; message: string }
  | { kind: "empty" }
  | { kind: "degraded"; message: string; retry: boolean }
  | { kind: "ready" };

/** Keeps event-feed rendering decisions pure for browser-free component tests. */
export function getEventFeedState({ events, loading, error }: { events: SentinelEvent[]; loading: boolean; error: string }): EventFeedState {
  if (loading && events.length === 0) return { kind: "loading" };
  if (error && events.length === 0) return { kind: "unavailable", message: error };
  if (events.length === 0) return { kind: "empty" };
  if (error) return { kind: "degraded", message: error, retry: true };
  return { kind: "ready" };
}
