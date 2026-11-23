export const visualRegressionStates = [
  "loading",
  "empty",
  "success",
  "stale",
  "error",
  "recovery",
] as const;

export type VisualRegressionState = (typeof visualRegressionStates)[number];

export const visualRegressionFixtures: Record<VisualRegressionState, {
  heading: string;
  status: string;
  account: string;
  transaction?: string;
}> = {
  loading: {
    heading: "Loading dashboard",
    status: "Loading data",
    account: "G...placeholder",
  },
  empty: {
    heading: "No activity yet",
    status: "No data available",
    account: "G...placeholder",
  },
  success: {
    heading: "Dashboard results",
    status: "Data loaded",
    account: "G...placeholder",
    transaction: "evt-placeholder",
  },
  stale: {
    heading: "Dashboard results",
    status: "Data may be stale",
    account: "G...placeholder",
    transaction: "evt-placeholder",
  },
  error: {
    heading: "Dashboard unavailable",
    status: "Unable to load data",
    account: "G...placeholder",
  },
  recovery: {
    heading: "Dashboard results",
    status: "Data loaded after retry",
    account: "G...placeholder",
    transaction: "evt-placeholder",
  },
};

export function fixtureText(state: VisualRegressionState): string {
  return Object.values(visualRegressionFixtures[state]).join(" ");
}
