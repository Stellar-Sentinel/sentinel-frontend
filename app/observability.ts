type RuntimeEnvironment = "production" | "preview" | "development" | "unknown";

export type ObservabilityMetadata = {
  environment: RuntimeEnvironment;
  deployment_id?: string;
  commit_sha?: string;
  commit_ref?: string;
  api_origin?: string;
};

const MAX_METADATA_LENGTH = 160;

function bounded(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed.slice(0, MAX_METADATA_LENGTH) : undefined;
}

function runtimeEnvironment(value: string | undefined): RuntimeEnvironment {
  if (value === "production" || value === "preview" || value === "development") return value;
  return "unknown";
}

function publicApiOrigin(value: string | undefined) {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return undefined;
    return url.origin;
  } catch {
    return undefined;
  }
}

export function getObservabilityMetadata(env: Readonly<Record<string, string | undefined>> = process.env): ObservabilityMetadata {
  const metadata: ObservabilityMetadata = {
    environment: runtimeEnvironment(env.VERCEL_ENV || env.NODE_ENV),
  };

  const deploymentId = bounded(env.VERCEL_DEPLOYMENT_ID);
  const commitSha = bounded(env.VERCEL_GIT_COMMIT_SHA);
  const commitRef = bounded(env.VERCEL_GIT_COMMIT_REF);
  const apiOrigin = publicApiOrigin(env.NEXT_PUBLIC_API_BASE_URL);

  if (deploymentId) metadata.deployment_id = deploymentId;
  if (commitSha) metadata.commit_sha = commitSha;
  if (commitRef) metadata.commit_ref = commitRef;
  if (apiOrigin) metadata.api_origin = apiOrigin;
  return metadata;
}
