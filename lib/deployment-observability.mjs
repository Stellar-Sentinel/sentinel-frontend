const MAX_PUBLIC_VALUE_LENGTH = 120;

function publicValue(value) {
  if (typeof value !== "string") return "";
  return value.replace(/[\r\n]/g, "").trim().slice(0, MAX_PUBLIC_VALUE_LENGTH);
}

function publicOrigin(value) {
  const candidate = publicValue(value);
  if (!candidate) return "unknown API origin";
  try {
    const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
    if (!["http:", "https:"].includes(url.protocol)) return "unknown API origin";
    return url.origin;
  } catch {
    return "unknown API origin";
  }
}

/** Read only explicitly public, non-secret values exposed at build time. */
export function getDeploymentMetadata(env = {}) {
  const environment = publicValue(env.NEXT_PUBLIC_VERCEL_ENV || env.NODE_ENV) || "unknown";
  const commit = publicValue(env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA);
  const ref = publicValue(env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF);
  const url = publicValue(env.NEXT_PUBLIC_VERCEL_URL);

  return {
    environment,
    commit: commit ? commit.slice(0, 12) : "unknown",
    ref: ref || "unknown",
    url: url || "unknown",
  };
}

export function apiOrigin(apiBase) {
  return publicOrigin(apiBase);
}

export function runtimeDiagnostic(apiBase, metadata) {
  return `API origin: ${apiOrigin(apiBase)} · deployment: ${metadata.environment} · commit: ${metadata.commit}`;
}
