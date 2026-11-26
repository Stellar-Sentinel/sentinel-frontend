import { parseEventPage, type EventPage } from "../app/event-data.ts";

const baseEvent = {
  id: "evt-placeholder",
  ledger: 42,
  created_at: "2026-01-15T12:34:56Z",
  agent: "G...placeholder",
  subject: "G...placeholder",
  score: 70,
  contract_id: "C...placeholder",
};

export const visualFixtures = {
  loading: { events: [], pending: true, error: null },
  empty: { events: [], pending: false, error: null },
  success: {
    events: [baseEvent],
    pending: false,
    error: null,
  },
  degraded: {
    events: [{ ...baseEvent, report_digest: undefined }],
    pending: false,
    error: "Some optional fields were unavailable",
  },
  unavailable: { events: [], pending: false, error: "Unable to load events" },
  recovery: {
    events: [baseEvent],
    pending: false,
    error: null,
  },
} as const;

export function parseFixture(
  state: keyof typeof visualFixtures,
): EventPage {
  return parseEventPage({ events: visualFixtures[state].events });
}
