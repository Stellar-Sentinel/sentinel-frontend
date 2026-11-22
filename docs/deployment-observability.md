# Vercel deployment observability

The dashboard exposes a small, safe diagnostic surface for production support:

- `NEXT_PUBLIC_VERCEL_ENV` identifies the Vercel environment.
- `NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA` provides short build provenance.
- `NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF` and `NEXT_PUBLIC_VERCEL_URL` identify the
  source ref and deployment URL when configured.
- The API diagnostic reports only the parsed API origin, never a path,
  credential, request body, response payload, or stack trace.

Configure these as public, non-secret Vercel environment variables when the
deployment needs provenance in the footer. The fallback environment is the
build's `NODE_ENV`; missing Vercel values remain `unknown` rather than being
fabricated.

Runtime failures remain visible in the existing loading, empty, unavailable,
and retry states. The frontend does not send errors to a telemetry service.
Support should record the deployment environment, short commit, API origin,
and the user-facing failure text, then inspect Vercel build/runtime logs and
the Render API logs for the same deployment.

The regression coverage lives in `tests/privacy-boundary.test.mjs` and protects
origin sanitization, bounded provenance, safe diagnostic copy, and the absence
of telemetry sinks.
