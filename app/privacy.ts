const sensitivePatterns = [
  /(?:gh[pousr]_|github_pat_|-----BEGIN [A-Z ]*PRIVATE KEY-----)[A-Za-z0-9_+/=:-]*/gi,
  /\bG[A-Z2-7]{55}\b/g,
  /\b[0-9a-f]{64}\b/gi,
];

/** Keep user-facing errors useful without exposing credentials or identifiers. */
export function redactSensitiveText(value: string, maxLength = 180): string {
  return sensitivePatterns.reduce((text, pattern) => text.replace(pattern, "[redacted]"), value).slice(0, maxLength);
}
