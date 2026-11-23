const DEFAULT_API_BASE_URL = "http://localhost:8000";

/** Resolve the public build-time API base without accepting credentials. */
export function resolveApiBase(raw: string | undefined): string {
  const value = raw?.trim() || DEFAULT_API_BASE_URL;
  return value.replace(/\/+$/, "");
}

export { DEFAULT_API_BASE_URL };
