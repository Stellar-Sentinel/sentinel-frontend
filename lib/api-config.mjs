export const DEFAULT_API_BASE_URL = "http://localhost:8000";

const INVALID_CONFIGURATION_MESSAGE = "The API configuration is invalid. Contact the deployment owner.";

export function resolveApiConfig(rawValue) {
  const value = rawValue?.trim() || "";
  if (!value) return { baseUrl: DEFAULT_API_BASE_URL, source: "default", valid: true, error: "" };

  try {
    const url = new URL(value);
    const localHttp = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
    if (!(url.protocol === "https:" || (url.protocol === "http:" && localHttp))) throw new Error("insecure origin");
    if (url.username || url.password || url.pathname !== "/" || url.search || url.hash) throw new Error("origin required");
    return { baseUrl: url.origin, source: "explicit", valid: true, error: "" };
  } catch {
    return { baseUrl: "", source: "invalid", valid: false, error: INVALID_CONFIGURATION_MESSAGE };
  }
}
