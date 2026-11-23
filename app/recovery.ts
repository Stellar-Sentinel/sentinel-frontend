export function safeErrorMessage(error: unknown, fallback: string) {
  if (error instanceof DOMException && error.name === "AbortError") return "The request timed out. Try again.";
  if (error instanceof Error && error.message) {
    return error.message
      .replace(/(?:gh[pousr]_|github_pat_|-----BEGIN [A-Z ]*PRIVATE KEY-----)[A-Za-z0-9_+/=:-]*/gi, "[redacted]")
      .replace(/\bG[A-Z2-7]{55}\b/g, "[account redacted]")
      .replace(/\b[0-9a-f]{64}\b/gi, "[hash redacted]")
      .slice(0, 180);
  }
  return fallback;
}

export function networkUnavailableMessage() {
  return "We couldn’t check RPC health. Try again.";
}
