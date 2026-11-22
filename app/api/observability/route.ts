import { getObservabilityMetadata } from "../../observability";

export const dynamic = "force-dynamic";

export function GET() {
  return Response.json(getObservabilityMetadata(), {
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
